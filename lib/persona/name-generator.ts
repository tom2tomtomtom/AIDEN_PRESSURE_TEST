/**
 * Name Generator
 * Generates demographically appropriate names for personas
 */

import type { PersonaArchetype } from './archetype-loader'

// Name pools by demographic category
const FIRST_NAMES = {
  // Age-appropriate name pools
  young_adult: {
    female: ['Madison', 'Ashley', 'Brittany', 'Taylor', 'Kayla', 'Megan', 'Emma', 'Olivia', 'Ava', 'Sophia', 'Zoe', 'Chloe', 'Riley', 'Harper', 'Skylar'],
    male: ['Tyler', 'Brandon', 'Justin', 'Kyle', 'Dylan', 'Ethan', 'Aiden', 'Noah', 'Liam', 'Mason', 'Jake', 'Ryan', 'Austin', 'Blake', 'Chase']
  },
  young_family: {
    female: ['Jennifer', 'Jessica', 'Amanda', 'Melissa', 'Sarah', 'Nicole', 'Stephanie', 'Lauren', 'Rachel', 'Emily', 'Katie', 'Amy', 'Christina', 'Heather', 'Angela'],
    male: ['Michael', 'Christopher', 'Matthew', 'Joshua', 'David', 'Andrew', 'Daniel', 'James', 'Joseph', 'Ryan', 'Brian', 'Kevin', 'Jason', 'Eric', 'Adam']
  },
  established_family: {
    female: ['Michelle', 'Lisa', 'Karen', 'Susan', 'Amy', 'Angela', 'Rebecca', 'Laura', 'Kim', 'Tammy', 'Dawn', 'Tracy', 'Tina', 'Beth', 'Julie'],
    male: ['Robert', 'John', 'David', 'Mark', 'Richard', 'Steve', 'Thomas', 'William', 'Paul', 'Greg', 'Scott', 'Jeff', 'Tim', 'Chris', 'Mike']
  },
  established_professional: {
    female: ['Catherine', 'Elizabeth', 'Margaret', 'Patricia', 'Jennifer', 'Christine', 'Rebecca', 'Andrea', 'Michelle', 'Carolyn', 'Victoria', 'Alexandra', 'Diane', 'Laura', 'Marie'],
    male: ['William', 'James', 'Robert', 'Michael', 'Richard', 'Charles', 'Joseph', 'Thomas', 'Daniel', 'Steven', 'Andrew', 'David', 'Christopher', 'Brian', 'Mark']
  },
  empty_nest: {
    female: ['Barbara', 'Patricia', 'Linda', 'Susan', 'Carol', 'Nancy', 'Deborah', 'Sandra', 'Sharon', 'Donna', 'Judy', 'Janet', 'Diane', 'Jean', 'Joyce'],
    male: ['Robert', 'William', 'Richard', 'Thomas', 'Ronald', 'Donald', 'George', 'Kenneth', 'Edward', 'Raymond', 'Larry', 'Gary', 'Dennis', 'Jerry', 'Frank']
  },
  busy_professional: {
    female: ['Katherine', 'Amanda', 'Stephanie', 'Nicole', 'Sarah', 'Melissa', 'Christina', 'Lauren', 'Heather', 'Amy', 'Rachel', 'Andrea', 'Diana', 'Victoria', 'Jessica'],
    male: ['Jason', 'Brian', 'Eric', 'Matthew', 'Kevin', 'Adam', 'Patrick', 'Ryan', 'Brandon', 'Jonathan', 'Aaron', 'Scott', 'Sean', 'Derek', 'Nathan']
  },
  aspirational_professional: {
    female: ['Alexandra', 'Victoria', 'Natalie', 'Megan', 'Taylor', 'Lindsay', 'Courtney', 'Lauren', 'Allison', 'Samantha', 'Morgan', 'Whitney', 'Brooke', 'Chelsea', 'Ashley'],
    male: ['Alexander', 'Benjamin', 'Nicholas', 'Andrew', 'Tyler', 'Brandon', 'Zachary', 'Trevor', 'Grant', 'Blake', 'Connor', 'Kyle', 'Derek', 'Mitchell', 'Spencer']
  },
  values_driven: {
    female: ['Sierra', 'Aurora', 'Luna', 'Willow', 'Sage', 'River', 'Summer', 'Maya', 'Ivy', 'Jasmine', 'Iris', 'Ruby', 'Violet', 'Hazel', 'Autumn'],
    male: ['River', 'Phoenix', 'Jasper', 'Felix', 'Ezra', 'Oliver', 'Finn', 'Leo', 'Miles', 'Theo', 'Oscar', 'Jonah', 'Eli', 'Isaac', 'Owen']
  }
}

// Default names if lifestage not matched
const DEFAULT_NAMES = {
  female: ['Sarah', 'Jennifer', 'Michelle', 'Amanda', 'Emily', 'Nicole', 'Rachel', 'Lauren', 'Katie', 'Jessica'],
  male: ['Michael', 'David', 'John', 'Chris', 'Matt', 'Jason', 'Ryan', 'Brian', 'Steve', 'Tom']
}

// Last names (common American surnames)
const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
  'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill',
  'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell',
  'Mitchell', 'Carter', 'Roberts', 'Chen', 'Kim', 'Patel', 'Murphy', 'Sullivan'
]

export interface GeneratedName {
  firstName: string
  lastName: string
  fullName: string
  initial: string
}

/**
 * Generate a demographically appropriate name
 */
export function generateName(archetype: PersonaArchetype): GeneratedName {
  const lifestage = archetype.demographics.lifestage
  const gender = Math.random() > 0.5 ? 'female' : 'male'

  // Get appropriate name pool
  const namePool = (FIRST_NAMES as Record<string, typeof FIRST_NAMES.young_adult>)[lifestage] || DEFAULT_NAMES
  const firstNames = namePool[gender]

  // Select random first and last name
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]!
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]!

  return {
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    initial: `${firstName[0]}${lastName[0]}`
  }
}

/**
 * Generate a specific age within the archetype's age range
 */
export function generateAge(archetype: PersonaArchetype): number {
  const ageRange = archetype.demographics.age_range
  const [minStr, maxStr] = ageRange.split('-')
  const min = parseInt(minStr || '30', 10)
  const max = parseInt(maxStr || '50', 10)

  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Generate a location description based on demographic
 */
export function generateLocation(archetype: PersonaArchetype): string {
  const locationType = archetype.demographics.location

  const locationDescriptions: Record<string, string[]> = {
    suburban: ['a quiet suburb outside Dallas', 'suburban Atlanta', 'the suburbs of Chicago', 'a family-friendly neighborhood in Phoenix', 'suburban Denver'],
    urban: ['downtown Seattle', 'Brooklyn, NY', 'central Austin', 'San Francisco', 'urban Portland'],
    urban_affluent: ['Manhattan\'s Upper West Side', 'Pacific Heights, San Francisco', 'Buckhead, Atlanta', 'Highland Park, Dallas', 'North Shore Chicago'],
    mixed: ['a mid-sized city in the Midwest', 'a growing metro area in the South', 'the outskirts of a coastal city', 'a college town', 'a revitalized urban neighborhood']
  }

  const defaultOptions = ['a mid-sized city in the Midwest', 'a growing metro area in the South', 'the outskirts of a coastal city']
  const options = locationDescriptions[locationType] ?? defaultOptions
  return options[Math.floor(Math.random() * options.length)] ?? defaultOptions[0]!
}
