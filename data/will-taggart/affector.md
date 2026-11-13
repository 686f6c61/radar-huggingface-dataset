# will-taggart/AFFECTOR

## Resumen

AFFECTOR es una aplicación nativa para macOS (Apple Silicon) que implementa técnicas de *activation steering* sobre el modelo Qwen3.5-0.8B para reescribir textos siguiendo una trayectoria emocional definida por el usuario. Lo desarrolla William Taggart, del departamento de Lenguas y Literaturas Modernas y Clásicas de Virginia Tech, y se distribuye a través de Hugging Face como una aplicación de escritorio empaquetada que incluye los pesos completos del modelo, un intérprete de Python y sus dependencias. No se trata de un checkpoint nuevo ni de un modelo afinado, sino de una herramienta que interviene sobre las activaciones internas de un transformer congelado.

La propuesta central es la noción de "geometría emocional": una secuencia ordenada de coordenadas de valencia (de -1 desagradable a +1 agradable), dirección (de -1 centrado en uno mismo a +1 centrado en el mundo) e intensidad (de 0 débil a 1 fuerte), cada una asociada a una posición normalizada del documento. La aplicación interpola esa trayectoria en cada fragmento de entrada y aplica una perturbación calibrada sobre las activaciones de capas seleccionadas del transformer, sin necesidad de entrenamiento adicional.

El modelo base es Qwen3.5-0.8B, un transformer de 0,8 mil millones de parámetros. El repositorio ocupa 1,7 GB e incluye la aplicación firmada y notarizada por Apple, requiere macOS 26 o superior y no funciona en Macs Intel. El autor advierte explícitamente que es una aplicación experimental y no un modelo validado de transferencia emocional: la salida puede ser fluida pero no reflejar las emociones pedidas, o alterar hechos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-0.8B) con intervención por activation steering |
| Parametros totales | 0,8 mil millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen los pesos completos del modelo base) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (pesos completos de Qwen3.5-0.8B incluidos en la app) |

## Arquitectura y entrenamiento

AFFECTOR no entrena ni afina ningún modelo. Se apoya en Qwen3.5-0.8B congelado y aplica *activation steering*: en modo local, calibra una base de activación editable a partir de ejemplos contrastivos breves y la aplica dentro de bloques seleccionados del transformer. El usuario puede elegir las capas (por defecto las 8, 16 y 23 con pesos 1, 1 y 0,5), la fuerza de la perturbación (por defecto 0,12), el presupuesto máximo de perturbación RMS relativo al RMS del estado oculto actual (por defecto 0,20) y la inercia que suaviza perturbaciones sucesivas dentro de un fragmento (por defecto 0,20).

La generación opera sobre fragmentos de hasta 700 caracteres con detección de fin de frase, buscando un cierre completo tras el 85 % de la longitud original del fragmento y detectando salidas repetitivas. La salida apunta a la longitud original con un techo compartido del 125 % de caracteres por párrafo. En modo API (OpenAI o VT ARC) no hay acceso a las activaciones del modelo alojado y las coordenadas se comunican mediante instrucciones en el prompt, por lo que fuerza y presupuesto no alteran activaciones en ese modo.

## Capacidades

- Generación de texto en inglés mediante reescritura de documentos existentes (`.txt`, `.rtf`, `.docx`).
- Control de la trayectoria emocional del texto a lo largo del documento mediante coordenadas de valencia, dirección e intensidad.
- Cuatro niveles de intervención: Minimal, Restrained, Balanced y Creative, que van de cambios mínimos de redacción a invención sustancial.
- Modo local con inferencia en GPU de Apple Silicon (con fallback a CPU) y modo API con proveedores externos (OpenAI, VT ARC).
- Verificación separada del texto original frente al revisado respecto a las coordenadas solicitadas.
- Guardado y reanudación de transfer checkpoints, exportación de la salida y del informe.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Reescritura de narrativa con arco emocional: un escritor define una trayectoria de tensión creciente a lo largo de un relato y AFFECTOR reescribe cada fragmento interpolando las coordenadas en su punto medio, útil para explorar variantes de tono sin reescribir manualmente.
- Adaptación de tono en comunicación corporativa: convertir un comunicado neutro en una versión más cálida o más urgente ajustando valencia e intensidad por tramos del documento, con el nivel Balanced para preservar la estructura.
- Experimentación académica en humanidades digitales: investigadores en lenguas y literatura pueden estudiar cómo las intervenciones sobre activaciones de un transformer pequeño afectan a la carga afectiva del texto, con la vista de verificación para evaluar resultados.
- Edición de documentos largos por tramos: la división en fragmentos de hasta 700 caracteres con control de longitud y detección de repeticiones permite procesar documentos extensos manteniendo coherencia de longitud párrafo a párrafo.
- Prototipado de herramientas creativas offline: al incluir Python, dependencias y pesos en la app, se puede experimentar con activation steering en un Mac sin cuenta de API ni descarga separada de modelo.
- Comparación de estrategias de control emocional: alternar entre modo local (intervención en activaciones) y modo API (instrucciones en prompt) para contrastar ambos enfoques sobre el mismo documento y las mismas coordenadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo base tiene 0,8 mil millones de parámetros y el paquete completo ocupa aproximadamente 1,67 GB, por lo que la huella de memoria es reducida.
- GPU recomendadas: Apple Silicon (inferencia en GPU de Apple cuando está disponible, con fallback a CPU). No se documentan requisitos para GPU NVIDIA o AMD.
- Cabe en consumer GPU: sí, por tamaño del modelo base (0,8B), aunque la aplicación empaquetada solo se distribuye para macOS en Apple Silicon.
- Opciones de despliegue: aplicación nativa AFFECTOR para macOS 26 o superior; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AFFECTOR (Qwen3.5-0.8B + steering) | 0,8B | no disponible | Activation steering para reescritura emocional | no disponible | App macOS Apple Silicon en Hugging Face |
| Qwen3.5-0.8B (base) | 0,8B | no disponible | Generación de texto general | no disponible | Hugging Face |
| Herramientas de edición por prompt (p. ej. API de OpenAI) | no disponible | no disponible | Instrucciones en prompt | comercial | API |

No se dispone de datos de rendimiento comparativo entre AFFECTOR y estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El propio autor la describe como aplicación experimental, no como modelo validado de transferencia emocional: una salida fluida puede no reflejar las emociones pedidas o alterar hechos.
- Un steering extremo (fuerza o presupuesto cercanos a 1,0) puede provocar repeticiones y generaciones fallidas; la aplicación no reduce automáticamente los ajustes elegidos.
- Los textos cortos solo muestrean unas pocas posiciones de una trayectoria larga y no reproducen todas las transiciones.
- Las instrucciones de preservación son preferencias, no garantías; la importación y exportación conserva el contenido pero no el diseño, imágenes, cambios registrados ni formato enriquecido.
- Solo soporta inglés y macOS 26 o superior en Apple Silicon; no funciona en Macs Intel ni en macOS 15.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido.
- El modo API requiere credenciales propias y puede generar costes; en ese modo no se controlan las activaciones del modelo alojado.
- Riesgo de alucinación y de sesgos del modelo base no cuantificado en la información disponible; se recomienda usar la vista de verificación y un evaluador independiente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/will-taggart/AFFECTOR
- Descarga de la aplicación para macOS Apple Silicon: https://huggingface.co/will-taggart/AFFECTOR/resolve/main/downloads/AFFECTOR-macOS-AppleSilicon.zip?download=true
- Artículo técnico (PDF): docs/AFFECTOR-Technical-Paper.pdf
- Explorador de archivos: https://huggingface.co/will-taggart/AFFECTOR/tree/main
- Checksums: SHA256SUMS.txt
- Estado de la release de Apple: RELEASE_STATUS.md
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
