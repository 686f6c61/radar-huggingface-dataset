# StefanoMancuso88/ISPOG_0.9.1

## Resumen

ISPOG (Is it Playable On Guitar?) es una herramienta de software, no un modelo de inteligencia artificial, desarrollada por Stefano Mancuso para el análisis automático de la jugabilidad de partituras en guitarra clásica. Analiza archivos MusicXML y determina si cada pasaje es ejecutable, difícil o imposible de tocar, devolviendo una partitura coloreada (verde, naranja o rojo) según el grado de dificultad. La versión actual es 0.9.1-alpha y se distribuye como aplicación de escritorio para Windows y macOS, además de una versión online basada en Gradio.

La herramienta aborda un problema específico de la informática musical: la verificación de la viabilidad física de una composición para guitarra, considerando la digitación, los acordes simultáneos, las cejillas y la afinación. Su relevancia radica en que facilita el trabajo de compositores y arreglistas que no son guitarristas expertos, permitiéndoles validar sus obras antes de la interpretación. No se trata de un modelo entrenado con datos, sino de un sistema basado en reglas y análisis algorítmico de la notación musical.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (herramienta de software basada en reglas) |
| Parametros totales | No aplica |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible (interfaz en inglés, según la documentación) |
| Licencia | ispog-research-only (uso exclusivo para investigación y educación; prohibida la redistribución comercial y la ingeniería inversa con fines de redistribución) |
| Formato de pesos | No aplica (distribuido como binarios ejecutables: .zip para Windows, .app para macOS) |
| Formato de entrada | .musicxml, .mxl (MusicXML comprimido) |
| Formato de salida | MusicXML con colores de nota según jugabilidad |

## Arquitectura y entrenamiento

ISPOG no es un modelo de aprendizaje automático ni un sistema basado en redes neuronales. Es una aplicación de escritorio programada en Python que implementa un análisis determinista de la partitura. Su lógica se basa en reglas musicológicas y físicas de la guitarra: evalúa la posición de los trastes, la extensión de la mano, la simultaneidad de notas, las digitaciones explícitas y la formación de cejillas. No existe un proceso de entrenamiento con datos; el comportamiento está definido por algoritmos heurísticos y conocimiento experto codificado.

La herramienta permite seleccionar la afinación (estándar, Drop D, Open G o personalizada) y el número de trastes, lo que influye en el análisis de viabilidad. El resultado es un archivo MusicXML en el que cada nota se colorea según su nivel de dificultad, permitiendo al usuario visualizar rápidamente los pasajes problemáticos.

## Capacidades

- Análisis de jugabilidad de partituras para guitarra clásica, evaluando si cada nota o acorde es físicamente ejecutable.
- Detección de acordes simultáneos y verificación de que todas las notas puedan pisarse sin solapamientos imposibles.
- Consideración de digitaciones explícitas (indicadas en la partitura) y sugerencia implícita de posiciones en el mástil.
- Detección de cejillas (barré) y evaluación de su dificultad según la extensión y el contexto.
- Soporte de afinaciones alternativas (Drop D, Open G) y afinaciones personalizadas definidas por el usuario.
- Generación de una partitura coloreada (verde = ejecutable, naranja = difícil, rojo = no ejecutable) como salida en MusicXML.
- Interfaz gráfica de escritorio para Windows y macOS, y versión online accesible mediante navegador.

## Casos de uso

- Composición asistida para guitarra: un compositor sin conocimientos profundos de guitarra puede escribir una partitura en un editor musical, exportarla a MusicXML y usar ISPOG para verificar si las ideas son físicamente tocables antes de enviarlas a un intérprete. Esto ahorra iteraciones y evita pasajes imposibles.
- Arreglos y transcripciones: al adaptar obras de otros instrumentos (piano, orquesta) a la guitarra, ISPOG ayuda a identificar qué acordes o líneas melódicas deben simplificarse o redistribuirse para mantener la viabilidad técnica.
- Educación musical: profesores de guitarra pueden utilizar ISPOG para generar ejemplos de partituras con distintos niveles de dificultad, mostrando a los estudiantes qué pasajes son más exigentes y por qué.
- Análisis musicológico: investigadores en informática musical pueden emplear ISPOG para estudiar la evolución de la escritura para guitarra, comparando la dificultad técnica de obras de diferentes épocas o compositores.
- Validación de obras encargadas: intérpretes o gestores de proyectos musicales pueden verificar rápidamente si una obra recién compuesta es realista antes de comprometer recursos para su estreno.
- Autoedición y publicación: compositores que autopublican partituras pueden usar ISPOG como control de calidad, asegurando que las obras publicadas sean ejecutables y reduciendo reclamaciones de intérpretes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al ser una herramienta de análisis determinista, su rendimiento depende de la complejidad de la partitura y de la implementación algorítmica, pero no existen métricas estandarizadas comparables a las de modelos de IA.

## Requisitos de hardware

- Aplicación de escritorio ligera: no requiere GPU ni hardware especializado. Funciona en cualquier ordenador con Windows o macOS moderno.
- La versión online (Gradio) se ejecuta en un servidor remoto; el usuario solo necesita un navegador web.
- El tamaño del repositorio es de 0.1 GB, lo que indica un paquete de instalación reducido.
- No se han publicado requisitos mínimos específicos de RAM o CPU, pero al ser una herramienta de análisis de archivos XML, es previsible que funcione con recursos modestos (2-4 GB de RAM son suficientes para partituras típicas).
- No se dispone de datos de latencia o throughput, ya que no es un servicio de inferencia en tiempo real.

## Comparativa con modelos similares

No disponible. ISPOG no es un modelo de IA y no existe una categoría directa de comparación con modelos de lenguaje o visión. En el ámbito de la informática musical, existen otras herramientas de análisis de partituras (como MuseScore con plugins, o software de notación con verificación de rango), pero ninguna ofrece exactamente la misma funcionalidad de evaluación de jugabilidad específica para guitarra clásica. No se han encontrado alternativas equivalentes en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: el uso está limitado a fines de investigación y educación. Queda prohibida la redistribución comercial y la ingeniería inversa del código fuente con fines de redistribución. Para usos comerciales, es necesario contactar al autor.
- Versión alfa: la versión 0.9.1 es una versión preliminar, no firmada digitalmente. En macOS, el sistema Gatekeeper puede bloquear la ejecución y el usuario debe autorizarla manualmente en Preferencias del Sistema → Seguridad y Privacidad.
- Alcance limitado a guitarra clásica: la herramienta está diseñada específicamente para guitarra clásica con seis cuerdas. No cubre otras guitarras (eléctrica, de siete cuerdas, etc.) ni otros instrumentos de cuerda pulsada.
- Dependencia de la calidad del MusicXML: el análisis se basa en la información contenida en el archivo MusicXML. Si la partitura carece de digitaciones explícitas o tiene notaciones ambiguas, el resultado puede ser menos preciso.
- Sin soporte de idiomas documentado: la interfaz parece estar en inglés, aunque no se especifica en la documentación.
- No es un modelo de IA: no ofrece capacidades de generación, razonamiento o aprendizaje. Es una herramienta de análisis determinista.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/StefanoMancuso88/ISPOG_0.9.1
- Versión online (Gradio): https://ispog.onrender.com/
- Paper asociado: Crecchi, Niccolò, y Stefano Mancuso. "Dealing with a Guitar's Historical Limit through Computer-Assisted Composition." En *Sounding the Posthuman: Proceedings of the 25th Colloquium on Music Informatics*. L’Aquila, Italia, 13–16 de octubre de 2026. En prensa.
