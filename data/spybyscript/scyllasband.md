# spybyscript/scyllasband

## Resumen

Scylla's Band es un modelo de síntesis de voz y canto desarrollado por el usuario de Hugging Face `spybyscript` (repositorio de runtime en la organización `lowkeytea`). Resuelve un problema doble: generar habla expresiva multilingüe y, con el mismo modelo, producir voz cantada a partir de una partitura melódica en JSON. La versión documentada es `v4-20261106`, que unifica habla y canto en un único flujo de difusión seleccionable mediante un modo de entrega (*delivery mode*), con dos decodificadores de forma de onda distintos.

La arquitectura combina un flujo de duración (*duration flow*) con un flujo generativo de tipo flow-matching destilado, más dos decodificadores neuronales: Vocos para habla y BigVGAN v2 para canto. El modelo ofrece catorce voces en seis idiomas (inglés, español, italiano, francés, alemán y vietnamita) y controles continuos de intensidad, ritmo y tono. Se distribuye en formatos LiteRT, ONNX, CoreML y PyTorch, con un runtime propio en C con ABI estable que corre en Linux, Windows, macOS, iOS, visionOS y Android.

Su relevancia actual radica en que ejecuta síntesis de voz y canto en dispositivo (*on-device*), incluido el navegador vía WebGPU, tras una descarga única de 303 MB para el paquete de habla. La licencia Apache 2.0 facilita su integración comercial. No se han publicado datos sobre el número de parámetros ni la longitud de contexto en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flujo de duración (*duration flow*) + flujo generativo flow-matching destilado; decodificadores Vocos (habla) y BigVGAN v2 (canto) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen bundles LiteRT, ONNX, CoreML y PyTorch; no se detallan niveles de cuantización) |
| Idiomas soportados | en, es, it, fr, de, vi |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT (TFLite), ONNX, CoreML, PyTorch |
| Voces | 14 |
| Controles de entrega | Intensidad, ritmo y tono, cada uno de −2 a 2 |
| Modos de canto | `pop` y `ballad` |
| Pasos de inferencia (canto) | 4 pasos Euler, sin *guidance* |
| Tamano del paquete de habla | 303 MB (descarga única del demo) |
| Tamano del repositorio | 20,9 GB |
| Version documentada | `v4-20261106` (anterior: `v3-20261104`) |

## Arquitectura y entrenamiento

El modelo separa la generación en dos etapas. Primero, un flujo de duración y un flujo generativo de tipo flow-matching producen la representación acústica intermedia a partir del texto, la voz y los controles de entrega. Después, un decodificador neuronal convierte esa representación en forma de onda: Vocos para habla y BigVGAN v2, ajustado fino sobre las voces del modelo, para canto. El runtime elige el decodificador según el modo de entrega (`delivery_mode_id`), un input adicional introducido en el contrato de grafo `scyllasband_measured_controls_v4`.

El entrenamiento del canto parte del flujo destilado de `v3`, continuado mediante *reflow* sobre material cantado: la salida hablada arranca idéntica a `v3`, mientras que las rutas cantada y de balada se destilan de un profesor entrenado en canto. Una segunda destilación, desde el campo con *classifier-free guidance* del profesor (melodía y modo desactivados, guidance 2), permite que el flujo reproduzca la respuesta guiada sin guía: 4 pasos Euler con una evaluación por paso, frente a los 8 pasos Heun con guía (32 evaluaciones) del primer candidato de canto (`v4-20261105`, no publicado). Según la model card, la claridad lírica y la precisión de tono se mantienen. Los controles de intensidad y ritmo se inyectan en los flujos de duración y generativo como valor dividido entre 5 en las ranuras de entrega 0 y 1, con bits de presencia; el ritmo además escala las pausas entre palabras por un factor exponencial (exp(−0,13 × valor)).

## Capacidades

- Síntesis de voz expresiva multilingüe en seis idiomas y catorce voces.
- Canto a partir de una partitura JSON con letra, tempo, estilo y notas `[label, pitch, beats]`, en modos `pop` y `ballad`.
- Control continuo de intensidad (calma a intensa), ritmo (lento a rápido) y tono (desplazamiento en semitonos), cada uno de −2 a 2.
- Manejo de palabras repartidas en varias notas o sílabas sostenidas mediante numeración (`baby~1`, `baby~2`) y silencios con la etiqueta `-`.
- Segmentación automática de frases en silencios de un cuarto de segundo o más, con renderizado frase a frase.
- Transposición automática de la canción por octavas al registro cantado de la voz (`--no-register` conserva la octava escrita).
- Ejecución en dispositivo: WebGPU o CPU en navegador, y runtime nativo en Linux, Windows, macOS, iOS, visionOS y Android.
- No se menciona soporte de *tool calling*, agentes ni visión en la información disponible.
- El modelo no canta de forma libre: requiere una partitura escrita por el usuario o por un planificador.

## Casos de uso

- **Locución y doblaje automatizado:** generación de voz en seis idiomas con control de intensidad y ritmo para adaptar la entrega al tono de cada escena, usando el decodificador Vocos y el runtime nativo en el sistema de producción.
- **Producción musical asistida:** conversión de letras y melodías escritas como JSON en pistas vocales cantadas en estilo pop o balada, con transposición automática al registro de la voz elegida y renderizado por frases.
- **Prototipado de canciones:** creación rápida de maquetas vocales a partir de una partitura melódica antes de grabar voces reales, aprovechando las veinte partituras de ejemplo incluidas en `melodies/`.
- **Aplicaciones web con privacidad por diseño:** el demo ejecuta el modelo de habla en el navegador tras una descarga de 303 MB y el texto introducido no sale del dispositivo, lo que encaja en herramientas de accesibilidad o lectura en voz alta con requisitos de privacidad.
- **Audiolibros y contenido narrativo:** narración multilingüe con control de ritmo para ajustar la velocidad de lectura y de intensidad para modular la expresividad según el pasaje.
- **Asistentes de voz embebidos:** integración en aplicaciones móviles iOS, Android y visionOS mediante los bundles CoreML o LiteRT y el runtime en C con ABI 3.1.0, sin dependencia de servicios en la nube.
- **Investigación en síntesis de canto:** uso de la partitura JSON y de los parámetros de muestreo (`--steps`, `--sampler`, `--guidance`, `--decoder`) para experimentar con distintas configuraciones de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta comparaciones cualitativas internas entre versiones (claridad lírica y precisión de tono sin cambios tras la segunda destilación) y datos de coste computacional: 4 pasos Euler sin guía para canto frente a 8 pasos Heun con guía (32 evaluaciones) del candidato `v4-20261105`.

## Requisitos de hardware

- El demo de habla requiere una descarga única de 303 MB y puede ejecutarse en el navegador con WebGPU (GPU) o en CPU.
- El paquete completo del repositorio ocupa 20,9 GB, aunque el runtime descarga únicamente el *flavor* necesario (`litert`, `coreml` o `coreai`).
- El runtime nativo (`python -m scyllasband build-native`) es descrito como mucho más rápido y ligero que el motor Python, con los mismos planes.
- No se especifican cifras de VRAM, GPU recomendadas, latencia ni throughput en la información disponible.
- Plataformas soportadas por el runtime: Linux, Windows, macOS, iOS, visionOS y Android.
- Opciones de despliegue: runtime propio `scyllasband` (Python y nativo en C), bundles LiteRT/TFLite, ONNX, CoreML y PyTorch. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de TTS.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. La model card no incluye comparaciones con otros sistemas de TTS o de síntesis de canto.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Canto |
|---|---|---|---|---|---|
| Scylla's Band `v4-20261106` | no disponible | no disponible | 6 | Apache 2.0 | Sí (partitura JSON) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo nunca canta de forma libre: exige una partitura con letra, tempo, estilo y notas; no genera melodía propia.
- Solo admite dos estilos de canto (`pop` y `ballad`); no se documentan otros géneros.
- Los controles se recortan al rango −2 a 2 si se solicitan valores fuera de él, y los controles no especificados toman el valor por defecto de la voz (0 en esta versión).
- Las frases se parten en silencios de un cuarto de segundo o más y se renderizan una a una, lo que puede afectar a la continuidad en pasajes con pausas frecuentes.
- Los runtimes compilados para `v3` rechazan el bundle `v4` por el nuevo input `delivery_mode_id`; es necesario actualizar el runtime o usar la etiqueta `v3-20261104-apple`.
- No se documentan sesgos conocidos, tasas de alucinación ni limitaciones específicas por idioma en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de las voces y de los datos de entrenamiento, no detalladas en la model card.
- No se especifican requisitos de memoria ni latencia, lo que dificulta planificar el dimensionamiento en producción sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/spybyscript/scyllasband
- Demo en Spaces: https://huggingface.co/spaces/spybyscript/scyllasband
- Demo alternativa: https://lowkeytea.dev/scyllasband/demo/
- Runtime en GitHub: https://github.com/lowkeytea/scyllasband
