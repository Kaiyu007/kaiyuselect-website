export const services = [
  {
    number: '01',
    title: '3D CAD Modelling',
    description: 'Accurate parts and assemblies created from sketches, measurements, reference images or existing components.',
  },
  {
    number: '02',
    title: '2D CAD & Technical Drawings',
    description: 'Layouts, profiles and dimensioned drawings prepared for review, quoting, fabrication or manufacturing.',
  },
  {
    number: '03',
    title: 'Product Design & Development',
    description: 'Functional products and components developed around intended use, mechanisms, dimensions and manufacturing requirements.',
  },
  {
    number: '04',
    title: 'Prototyping & Engineering Support',
    description: 'Preparation for 3D printing, CNC cutting, visualisation and preliminary engineering analysis.',
  },
  {
    number: '05',
    title: 'Reverse engineering support',
    description: 'Existing parts measured and translated into useful CAD geometry or supporting technical documentation.',
  },
  {
    number: '06',
    title: 'Design visualisation',
    description: 'Clear technical views and rendered concepts for design review, communication and early presentations.',
  },
  {
    number: '07',
    title: 'Project consultation',
    description: 'A focused discussion to clarify requirements, review available information and identify practical next steps.',
  },
];

export const consideredCategories = [
  { title: 'MagSafe accessories', description: 'Magnetic accessories for everyday phone use.' },
  { title: 'Car accessories', description: 'Practical mounting and organisation accessories.' },
  { title: 'Everyday electronics', description: 'Small electronics selected for useful everyday functions.' },
];

export interface Product {
  id: string;
  category: string;
  title: string;
  description: string;
  colour: string;
  compatibility: string | null;
  status: 'Enquire for availability' | 'Coming soon';
  image: string;
  alt: string;
}

export const featuredProducts: Product[] = [
  {
    category: 'Phone cases',
    id: 'pink-ripple',
    title: 'Pink ripple case',
    colour: 'Pink',
    compatibility: null,
    description: 'A soft pink case with a raised ripple texture, protective camera surround and comfortable everyday handling.',
    status: 'Enquire for availability',
    image: '/images/products/pink-ripple-case-in-hand.jpg',
    alt: 'Pink ripple-pattern phone case held in a hand',
  },
  {
    category: 'Phone cases',
    id: 'taupe-ripple',
    title: 'Taupe ripple case',
    colour: 'Taupe',
    compatibility: null,
    description: 'A neutral taupe case showing the concentric back texture and raised camera protection in close detail.',
    status: 'Enquire for availability',
    image: '/images/products/taupe-ripple-case-detail.jpg',
    alt: 'Close-up of a taupe ripple-pattern phone case held in a hand',
  },
  {
    category: 'Phone cases',
    id: 'yellow-ripple',
    title: 'Yellow ripple case',
    colour: 'Yellow',
    compatibility: null,
    description: 'A bright yellow ripple case selected for visible colour, practical grip and everyday phone protection.',
    status: 'Enquire for availability',
    image: '/images/products/yellow-ripple-case-in-hand.jpg',
    alt: 'Yellow ripple-pattern phone case held in a hand',
  },
  {
    category: 'Phone accessories',
    id: 'blue-ring-stand',
    title: 'Blue ring-stand case',
    colour: 'Blue',
    compatibility: null,
    description: 'A blue phone case with an integrated circular ring designed to support grip and hands-free positioning.',
    status: 'Enquire for availability',
    image: '/images/products/blue-ring-stand-in-hand.jpg',
    alt: 'Blue phone case with integrated circular ring stand held in a hand',
  },
];

export const featuredProject = {
  category: 'Academic Group Project',
  title: 'Electric Postie Bike CAD Development',
  shortDescription: 'A collaborative SolidWorks project exploring the development of an electric postie bike through component modelling, assembly integration, virtual prototyping and preliminary engineering analysis.',
  tags: ['SolidWorks', 'Mechanical Design', 'Preliminary FEA'],
  image: '/images/projects/postie-bike-full-assembly-render.jpg',
  imageAlt: 'Rendered SolidWorks assembly of an electric postie bike concept',
  imageFit: 'contain',
  imagePosition: 'center',
  projectUrl: '/projects/electric-postie-bike',
  linkLabel: 'View Case Study',
  status: 'Completed academic project',
};

export const projects = [
  {
    number: '01',
    category: 'Mechanical Design',
    title: 'Mechanical Assembly Design',
    shortDescription: 'A SolidWorks assembly showing rotating components, a housing and a supporting structure.',
    tags: ['SolidWorks', 'Mechanical assemblies', 'Motion systems'],
    image: '/images/projects/mechanical-assembly-design.jpg',
    imageAlt: 'SolidWorks mechanical assembly design with rotating components and support structure.',
    imageFit: 'contain',
    imagePosition: 'center',
    status: 'Case study in preparation',
  },
  {
    number: '02',
    category: 'Robotic Systems',
    title: 'Robotic System Development',
    shortDescription: 'A CAD view of a mobile robotic platform and its articulated mechanism.',
    tags: ['Robotic platforms', 'Mechanisms', 'Integration'],
    image: '/images/projects/robotic-platform-design.jpg',
    imageAlt: 'SolidWorks model of a mobile robotic platform with an articulated mechanism.',
    imageFit: 'contain',
    imagePosition: 'center',
    status: 'Case study in preparation',
  },
  {
    number: '03',
    category: 'Technical Documentation',
    title: 'Exploded Views & Documentation',
    shortDescription: 'An exploded linear-stage assembly showing the relationship between its component parts.',
    tags: ['Exploded views', 'Assembly sequence', 'Documentation'],
    image: '/images/projects/linear-stage-exploded-view.jpg',
    imageAlt: 'Exploded SolidWorks assembly view of a precision linear motion stage.',
    imageFit: 'contain',
    imagePosition: 'center',
    status: 'Case study in preparation',
  },
  {
    number: '04',
    category: 'Engineering Analysis',
    title: 'Structural Analysis',
    shortDescription: 'A preliminary displacement analysis visual for a structural frame. Loading assumptions and validation are not documented in this gallery.',
    tags: ['Preliminary FEA', 'Displacement', 'Design review'],
    image: '/images/projects/structural-frame-fea.jpg',
    imageAlt: 'Finite element displacement analysis of a large structural frame.',
    imageFit: 'contain',
    imagePosition: 'center',
    status: 'Case study in preparation',
  },
];
