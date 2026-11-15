# yamada2wasabi/brain-ai-v1-preview

## Resumen

brain-ai v1 preview es un modelo de lenguaje japonés extremadamente pequeño (14.698.560 parámetros, d_model 384) desarrollado por el usuario yamada2wasabi. Su objetivo no es competir en capacidad general, sino demostrar que un modelo conversacional puede ejecutarse completamente offline en hardware muy limitado: concretamente en la agenda electrónica Sharp Brain (Windows CE 6.0, ARM926EJ-S a 454 MHz, sin unidad de coma flotante y con 128 MB de RAM). Para lograrlo combina una arquitectura de espacio de estados Mamba-2 de 12 capas con pesos ternarios según BitNet b1.58 (-1, 0, +1), empaquetados en un fichero de aproximadamente 6,7 MB para el dispositivo.

El modelo está entrenado exclusivamente en japonés y su diseño se apoya en la delegación de capacidades a herramientas externas: calculadora (`calc`), búsqueda en enciclopedia offline (`search`), notas (`memo`) y hora (`time`). Esta aproximación permite que un modelo de apenas 15 millones de parámetros ofrezca respuestas útiles en conversación cotidiana, consultas sencillas de programación y operaciones aritméticas, compensando con tool calling la falta de conocimiento paramétrico.

Es relevante ahora porque explora una frontera poco habitual: inferencia entera, sin coma flotante, sobre silicio de hace dos décadas. La versión publicada en Hugging Face es una vista previa con limitaciones explícitas de precisión y conocimiento, pensada para experimentación e integración en el ecosistema transformers, no para producción con requisitos de exactitud.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mamba-2 (modelo de espacio de estados), 12 capas, con pesos ternarios BitNet b1.58 |
| Parámetros totales | 14.698.560 (d_model 384) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Pesos ternarios (-1 / 0 / +1) en el motor de dispositivo; el repo transformers almacena los pesos ternarios expandidos a reales |
| Idiomas soportados | Japonés (ja) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (transformers, `Mamba2ForCausalLM`); formato propio empaquetado de ~6,7 MB para el dispositivo |
| Vocabulario | 9.501 tokens (SentencePiece) |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo emplea Mamba-2, un modelo de espacio de estados (SSM) con 12 capas y dimensión de modelo 384, cuyos pesos se cuantizan de forma ternaria siguiendo el esquema BitNet b1.58. Esta combinación evita por completo las operaciones en coma flotante en el motor de inferencia del dispositivo, algo imprescindible en un procesador ARM926EJ-S sin FPU. En el repositorio de Hugging Face los pesos ternarios se expanden a valores reales para que puedan cargarse con `transformers`; el motor de dispositivo usa un formato empaquetado propio de aproximadamente 6,7 MB.

El entrenamiento se organiza en tres fases: (1) preentrenamiento con Wikipedia en japonés (unos 180 millones de tokens); (2) preentrenamiento continuado con código fuente de github-code-clean, restringido a licencias MIT, Apache-2.0 y BSD; y (3) ajuste por instrucciones (SFT) mediante destilación de conocimiento a partir de datos de diálogo generados por Qwen3.8-27B (Apache-2.0), que cubren conversación cotidiana, llamadas a herramientas, código verificado por ejecución, búsqueda enciclopédica, problemas de razonamiento y uso de calculadora. El modelo incorpora además, en la aplicación distribuida (no en el repo transformers), una unidad de cálculo interna (IGC) que resuelve de forma determinista operaciones aritméticas, porcentajes y potencias que aparecen en el texto.

## Capacidades

- Generación de texto conversacional en japonés para diálogos cotidianos y consultas de asesoramiento.
- Razonamiento aritmético básico mediante la unidad de cálculo interna (IGC) en la app distribuida, y mediante la herramienta `calc` en el formato de tool calling.
- Llamada a herramientas con el formato `<|call|>herramienta: argumento<|end|>` y consumo del resultado con `<|result|>resultado<|end|>`: funciones `calc`, `search`, `memo` y `time`.
- Respuestas a preguntas sencillas de programación en Python, C, C++, Java y Go.
- Búsqueda en enciclopedia offline a través de la herramienta `search`.
- Gestión de notas y consulta de la hora mediante herramientas dedicadas.
- Capacidad multilingüe: únicamente japonés; no se documenta soporte de otros idiomas.
- No se documentan modos de razonamiento extendido, visión ni audio.

## Casos de uso

- Asistente conversacional offline en dispositivos empotrados: el modelo está diseñado para ejecutarse sin red ni GPU en hardware tipo agenda electrónica, lo que permite integrarlo en terminales de bajo consumo con respuestas en japonés.
- Calculadora conversacional: combinando la herramienta `calc` con la IGC, el modelo puede resolver operaciones aritméticas, porcentajes y potencias planteadas en lenguaje natural, delegando el cálculo exacto a componentes deterministas.
- Consulta rápida de conocimiento con enciclopedia local: la herramienta `search` permite responder preguntas factuales recuperando entradas de una enciclopedia offline, evitando depender de la memoria paramétrica del modelo.
- Asistencia básica de programación: responde preguntas sencillas sobre Python, C, C++, Java y Go, útil como ayuda de referencia en entornos sin conexión.
- Toma de notas por voz o texto en dispositivos de mano: la herramienta `memo` permite registrar y recuperar notas dentro del flujo conversacional.
- Prototipado e investigación en inferencia entera: sirve como banco de pruebas para estudiar SSM ternarios, cuantización BitNet y decodificación sin coma flotante en silicio antiguo.
- Integración en pipelines de transformers para experimentación: al publicarse como `Mamba2ForCausalLM`, puede cargarse con la librería estándar para evaluar su comportamiento fuera del dispositivo.

## Benchmarks y rendimiento

Los únicos datos disponibles son evaluaciones propias del autor, no comparables con benchmarks estándar externos.

| Prueba | Resultado |
|---|---|
| Razonamiento (700 problemas: cálculo, ordenación, lógica, etc.) | 69,0 % |
| Generación de código Python (50 problemas, evaluados por ejecución) | 11 / 50 |
| Coincidencia de siguiente token entre repo transformers y motor de dispositivo | ~94 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Inferencia en dispositivo: ARM926EJ-S a 454 MHz, sin FPU, con 128 MB de RAM; el modelo ocupa unos 6,7 MB en formato empaquetado.
- VRAM estimada para inferencia en GPU: no disponible; el modelo es lo bastante pequeño (14,7 M de parámetros) para caber en cualquier GPU consumer, pero no se documentan requisitos.
- GPU recomendadas: no disponible; no se proporcionan datos de latencia ni throughput en GPU.
- Cabe en GPU consumer: sí, por tamaño (menos de 0,1 GB de pesos), aunque no hay cifras oficiales.
- Opciones de despliegue: `transformers` (formato del repositorio), aplicación propia distribuida en `app/brainai-v1-preview.zip` para PC con Windows, dispositivo Brain y Device Emulator.
- Latencia y throughput: no disponibles. El autor indica que el funcionamiento en hardware Brain real no está verificado; solo se ha probado en el Device Emulator.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Por tamaño y enfoque (modelo japonés minúsculo para dispositivo), los candidatos habituales serían modelos tiny de la familia GPT-2 o variantes BitNet, pero no se aportan datos de rendimiento que permitan una comparación rigurosa.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| brain-ai v1 preview | 14,7 M | no disponible | CC BY-SA 4.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo en vista previa: el propio autor advierte que no debe usarse en aplicaciones que requieran exactitud.
- Conocimiento factual limitado y propensión a generar contenido incorrecto (alucinaciones).
- Debilidades documentadas: cálculo de días de la semana, referencia a contenido mencionado al principio de la conversación, generación de textos largos y conocimiento factual preciso.
- Solo japonés: no hay soporte documentado de otros idiomas.
- Diferencias entre el repo transformers y el motor de dispositivo: se omiten la cuantización int8 de activaciones y la IGC, con una coincidencia de siguiente token de aproximadamente el 94 %.
- El funcionamiento en hardware Brain real no está verificado; solo se ha probado en el Device Emulator.
- Licencia CC BY-SA 4.0: impone atribución y compartir bajo la misma licencia las obras derivadas, lo que condiciona el uso comercial y la distribución.
- La licencia se justifica por incorporar conocimiento derivado de Wikipedia en japonés (CC BY-SA 4.0); los datos de código provienen solo de repositorios MIT, Apache-2.0 y BSD, y los datos de SFT de Qwen3.8-27B (Apache-2.0).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yamada2wasabi/brain-ai-v1-preview
- Discusiones y reporte de incidencias: https://huggingface.co/yamada2wasabi/brain-ai-v1-preview/discussions
- Aplicación distribuida (PC / Brain / Device Emulator): `app/brainai-v1-preview.zip` dentro del repositorio
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
