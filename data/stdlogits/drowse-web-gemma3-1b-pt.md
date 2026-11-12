# stdlogits/drowse-web-gemma3-1b-pt

## Resumen

`stdlogits/drowse-web-gemma3-1b-pt` es una conversión del modelo base `google/gemma-3-1b-pt` de Google, empaquetada específicamente para su ejecución en navegador mediante WebGPU a través de la plataforma drowse.ai. No se trata de un checkpoint estándar de Transformers, sino de un conjunto de artefactos de navegador: pesos convertidos con MLC LLM, tokenizador, una biblioteca de modelo en WebAssembly con los hooks de instrumentación de drowse compilados y un paquete de geometría base con estadísticas neutras y variedades de conceptos por contexto.

El propósito del modelo es la interpretabilidad en tiempo real: drowse lee y dirige el modelo mientras genera, exponiendo representaciones internas a través de lentes (R lens, S lens) y unidades que se distribuyen en un repositorio separado. Es, por tanto, un modelo de completado crudo (raw-completion base model), sin ajuste de instrucciones, orientado a experimentación con mecánica interna de transformers pequeños en el cliente.

La relevancia actual radica en su enfoque de despliegue: inferencia local en el navegador sin servidor, con cuantización de 4 bits y cómputo en float32, contexto de 2048 tokens y verificación criptográfica de cada artefacto mediante SHA-256. El repositorio ocupa 0,7 GB y acumula 27 descargas desde su creación en septiembre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3, base) |
| Parámetros totales | 1B (heredado de google/gemma-3-1b-pt) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | `q4f32_1`: pesos 4-bit, cómputo float32 |
| Idiomas soportados | no disponible |
| Licencia | `mixed-artifact-licenses` (por componente; ver LICENSES.md) |
| Formato de pesos | Artefactos MLC LLM para WebGPU (no safetensors ni GGUF estándar) |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 3 1B en su variante preentrenada (`-pt`), es decir, un transformer decoder-only sin ajuste por instrucciones ni alineamiento RLHF/DPO. Sobre esa base, el repositorio aplica una conversión con MLC LLM a un formato ejecutable en WebGPU, con pesos cuantizados a 4 bits y acumulación en float32 (`q4f32_1`). La biblioteca de modelo se compila como WebAssembly con el runtime `drowse-web-runtime-v2`, el ABI de hooks `block-sites-v5` y el perfil `standard-v4`, lo que permite interceptar activaciones en puntos concretos de los bloques del transformer.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni detalles del preentrenamiento de Gemma 3 1B en la documentación proporcionada. La innovación técnica destacable no está en el entrenamiento sino en el empaquetado: hooks de interpretabilidad compilados en el binario, un paquete de geometría base con estadísticas neutras y variedades de conceptos por contexto, y un sistema de reproducibilidad que registra en `drowse-build.json` los ficheros fuente exactos, el commit base de MLC LLM y el hash de cada overlay del compilador.

## Capacidades

- Generación de texto por completado crudo (raw completion), sin plantilla de instrucciones ni formato de chat.
- Lectura y dirección de representaciones internas durante la generación mediante hooks de interpretabilidad (lentes R y S, unidades).
- Ejecución en navegador sobre WebGPU, sin backend remoto.
- Contexto de 2048 tokens para completados de longitud moderada.
- Integración con el catálogo firmado de drowse.ai, que fija cada descarga a una revisión inmutable y verifica el digest SHA-256 de cada fichero.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en interpretabilidad: el modelo expone activaciones en sitios de bloque concretos mediante el ABI `block-sites-v5`, lo que permite estudiar cómo se forman conceptos durante la generación sin infraestructura de servidor.
- Experimentación educativa en navegador: al ejecutarse íntegramente en WebGPU, sirve para demostraciones interactivas de mecánica interna de transformers en un portátil con GPU integrada.
- Prototipado de herramientas de dirección de conceptos: las lentes y unidades del paquete de instrumentos permiten probar técnicas de steering sobre un modelo de 1B con contexto de 2048 tokens.
- Análisis de completados crudos: al ser un modelo base sin alineamiento, es adecuado para estudiar distribuciones de continuación de texto sin sesgo de formato conversacional.
- Auditoría de artefactos reproducibles: el registro de builds y digests permite verificar la cadena de compilación desde el checkpoint original de Google hasta el binario WebAssembly.
- Docencia sobre cuantización: la combinación `q4f32_1` (pesos 4-bit, cómputo float32) es un caso práctico para ilustrar compromisos entre memoria y precisión numérica en inferencia en el cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio completo ocupa 0,7 GB, por lo que los pesos en 4 bits caben holgadamente en memorias gráficas de consumo.
- GPU recomendadas: cualquier GPU con soporte de WebGPU (por ejemplo, integradas de Apple Silicon, Intel o AMD recientes, y dedicadas NVIDIA/AMD compatibles con el navegador).
- Cabe en GPU de consumo: sí, por el tamaño del artefacto y la cuantización de 4 bits.
- Opciones de despliegue: exclusivamente el runtime de drowse.ai sobre WebGPU (`drowse-web-runtime-v2`); no es un checkpoint de Transformers, GGUF ni safetensors, por lo que no es directamente cargable en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Despliegue |
|---|---|---|---|---|---|
| stdlogits/drowse-web-gemma3-1b-pt | 1B | 2048 | q4f32_1 (4-bit, cómputo fp32) | mixed-artifact-licenses | WebGPU en navegador (drowse.ai) |
| google/gemma-3-1b-pt | 1B | no disponible en esta ficha | safetensors (original) | Gemma Terms of Use | Transformers, vLLM, etc. |
| Alternativas de 1B para interpretabilidad | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa de rendimiento con alternativas.

## Limitaciones y advertencias

- Modelo base sin ajuste de instrucciones: no sigue instrucciones de forma fiable ni mantiene formato conversacional; produce completados crudos.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Riesgo de alucinación y de continuaciones sesgadas inherente a un modelo preentrenado sin alineamiento; no se documentan evaluaciones de sesgo.
- Idiomas soportados no declarados; no se garantiza cobertura multilingüe más allá de la del modelo original.
- Licencia mixta por componente (`mixed-artifact-licenses`): es imprescindible revisar `LICENSES.md` antes de cualquier uso, incluido el comercial, ya que los términos de Gemma y los artefactos de drowse pueden diferir.
- No es un checkpoint estándar: no puede cargarse con Transformers, llama.cpp, Ollama, vLLM ni TGI; requiere el runtime y el catálogo firmado de drowse.ai.
- La verificación de integridad depende del catálogo firmado de drowse.ai; descargas fuera de ese canal no están cubiertas por la comprobación de digests.
- El proyecto está escrito por a9lim con asistencia de Claude según la model card; conviene evaluar la madurez del ecosistema antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/stdlogits/drowse-web-gemma3-1b-pt
- Modelo base: https://huggingface.co/google/gemma-3-1b-pt/tree/fcf18a2a879aab110ca39f8bffbccd5d49d8eb29
- Paquete de instrumentos (lentes R, S y unidades): https://huggingface.co/stdlogits/drowse-web-gemma3-1b-pt-instruments
- Licencias por componente: https://huggingface.co/stdlogits/drowse-web-gemma3-1b-pt/blob/main/LICENSES.md
- Plataforma drowse.ai: https://drowse.ai
- Repositorio de drowse: https://github.com/stdlogits/drowse
- Repositorio de la edición de navegador: https://github.com/stdlogits/drowse.ai
