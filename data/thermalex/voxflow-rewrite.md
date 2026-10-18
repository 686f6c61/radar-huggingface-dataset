# ThermalEX/voxflow-rewrite

## Resumen
VoxFlow Rewrite es un modelo de 1.942.653.248 parámetros (≈1,94B) publicado por ThermalEX, ajustado a partir de Qwen/Qwen3.5-2B mediante LoRA y exportado a GGUF para llama.cpp. Su función no es transcribir audio, sino convertir el texto bruto que devuelve un sistema de reconocimiento de voz en el texto final que el usuario quería escribir: elimina muletillas, aplica autocorrecciones habladas, ejecuta órdenes dictadas y propone hasta tres reescrituras.

Forma parte de VoxFlow, una aplicación de entrada por voz para Windows, y está orientado a inferencia local: la model card reporta una latencia mediana de 0,14 s por frase en un portátil con 6 GB de VRAM y cuantización Q8. Solo declara chino e inglés, licencia Apache 2.0 y dos tareas separadas por prompts de sistema que deben usarse literalmente. La configuración de ejemplo emplea 4096 tokens de contexto; no se especifica la longitud máxima nativa ni se detalla la arquitectura interna del modelo base.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la información proporcionada; se trata de un ajuste LoRA de Qwen/Qwen3.5-2B exportado a GGUF |
| Parámetros totales | 1.942.653.248 (≈1,94B) |
| Parámetros activos | No disponible; no se indica que el modelo sea MoE |
| Longitud de contexto | 4096 tokens en la configuración de ejemplo de llama-server; no se especifica la máxima nativa |
| Tipos de cuantización | q8_0 (1,9 GB) y q4_k_m (1,2 GB) |
| Idiomas soportados | Chino (zh) e inglés (en); conserva mezclas zh-en en los ejemplos |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF para llama.cpp |
| Modelo base | Qwen/Qwen3.5-2B |
| Tamaño del repositorio | 3,4 GB |

## Arquitectura y entrenamiento
El ajuste se realizó sobre Qwen/Qwen3.5-2B con LoRA en bf16, rank 16, tasa de aprendizaje 2e-4 y 2 épocas, usando Unsloth; el entrenamiento se completó en aproximadamente 34 minutos en una RTX 3060 Laptop con 6 GB. El resultado se exportó a GGUF para llama.cpp. La información disponible no detalla la arquitectura interna del modelo base, la composición original de su corpus ni si hubo RLHF o DPO.

El dataset de ajuste contiene 1427 semillas escritas a mano más muestras ampliadas mediante inyección programática de muletillas y repeticiones, hasta un total de 3424 ejemplos (3138 de entrenamiento, 134 de validación y 152 de prueba). Cubre 14 clases de fenómenos del habla: muletillas, repeticiones, autocorrecciones inmediatas, eliminaciones, sustituciones y añadidos retrospectivos, correcciones con justificación, formato de dictado, instrucciones de traducción y tono, y contraejemplos que deben conservarse literalmente. Todos los datos son sintéticos y no contienen datos reales de usuarios. En inferencia se deben usar exactamente los dos prompts de sistema del repositorio, uno para limpieza y ejecución de órdenes y otro para generar sugerencias JSON; además, la model card exige desactivar el modo thinking.

## Capacidades
- Limpieza de texto procedente de reconocimiento automático del habla: elimina muletillas, repeticiones y fragmentos redundantes.
- Aplicación de autocorrecciones habladas del tipo «Friday, no, Saturday» y de eliminaciones retrospectivas como «去掉苹果».
- Ejecución de órdenes dictadas en línea, como «translate to English» o «make it more polite», eliminando la instrucción del texto final.
- Generación de entre 0 y 3 sugerencias de reescritura en JSON con etiquetas como «más formal».
- Traducción chino-inglés y ajuste de tono; la evaluación reporta un chrF de 64,8 en traducción para la versión v4.
- Preservación de términos mixtos chino-inglés, por ejemplo manteniendo «护照» sin traducir.
- Despliegue local mediante llama.cpp con endpoint compatible con la API de OpenAI.
- Modo thinking disponible en el modelo base, pero debe desactivarse explícitamente para esta tarea.

## Casos de uso
- Dictado por voz en escritorio Windows: la aplicación VoxFlow envía la transcripción ASR y el prompt de limpieza a llama-server; el modelo devuelve el texto final sin muletillas. Es adecuado por la latencia mediana de 0,14 s y el consumo de aproximadamente 2,5 GB de VRAM en Q8.
- Autocorrección de dictado: el usuario dice una corrección sobre la marcha y el modelo aplica el cambio antes de entregar el texto, incluyendo eliminaciones y sustituciones retrospectivas.
- Ejecución de órdenes dictadas dentro del texto: traducir, cambiar el tono o reformular sin que la instrucción aparezca en la salida; la evaluación v4 reporta un 0% de instrucciones residuales.
- Sugerencias de reescritura en la interfaz: generar 0-3 alternativas etiquetadas en JSON para que el usuario elija; en v4 el 100% del JSON fue válido y cumplió las reglas.
- Reescritura de tono en comunicaciones: convertir una queja en una versión más educada para borradores de soporte o correo, con la advertencia de que la reformulación puede alterar matices de significado.
- Preservación de jerga y términos mixtos: mantener palabras o nombres en chino dentro de una frase en inglés, útil en viajes, documentación bilingüe o soporte a usuarios que mezclan idiomas.
- Procesamiento local por lotes de transcripciones: desplegar q4_k_m en equipos con poca VRAM y procesar dictados sin enviar datos a la nube; no se han publicado datos de throughput.
- Integración en herramientas internas compatibles con OpenAI: llamar a `/v1/chat/completions` con temperatura 0 desde un cliente existente, usando los prompts exactos y el modo thinking desactivado.

## Benchmarks y rendimiento
Evaluación de la versión v4 sobre un conjunto de prueba de 152 ejemplos con cuantización Q8:

| Métrica | Qwen3.5-2B sin ajuste* | voxflow-rewrite v4 |
|---|---|---|
| Tasa de error de caracteres (CER) | 0,74 | 0,20 |
| Instrucciones residuales | 31,9% | 0% |
| Frases que no debían cambiar y se conservan | 81% | 95% |
| chrF de traducción | 39,5 | 64,8 |
| JSON de sugerencias válido / conforme a reglas | 100% / 93% | 100% / 100% |
| Latencia mediana por frase | — | 0,14 s |

\* El modelo sin ajustar se midió sobre un conjunto de prueba anterior de 132 ejemplos; los valores son solo de referencia y no directamente comparables.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware
- VRAM estimada para q8_0: aproximadamente 2,5 GB, según la model card; el archivo pesa 1,9 GB.
- VRAM estimada para q4_k_m: no disponible; el archivo pesa 1,2 GB y la model card solo indica que ahorra más VRAM que Q8.
- GPU recomendadas: no se especifican modelos concretos. El caso documentado es un portátil con 6 GB de VRAM; el entrenamiento se realizó en una RTX 3060 Laptop de 6 GB.
- Cabe en GPU consumer: sí, según el caso documentado de 6 GB. No se indica un mínimo oficial para q8_0 o q4_k_m.
- Opciones de despliegue: llama.cpp mediante `llama-server`, con endpoint compatible con OpenAI. No se documentan vLLM, TGI, Ollama ni otras integraciones.
- Latencia: 0,14 s de mediana por frase en el entorno documentado. Throughput no disponible.
- No se documenta rendimiento en CPU, Apple Silicon ni GPUs de centro de datos como A100 o H100.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| voxflow-rewrite v4 | 1,94B | 4096 tokens en el ejemplo de despliegue | CER 0,20; instrucciones residuales 0%; chrF 64,8; 0,14 s por frase | Apache-2.0 | GGUF en HuggingFace |
| Qwen3.5-2B sin ajuste | 2B nominal; conteo exacto no disponible | No disponible | CER 0,74; instrucciones residuales 31,9%; chrF 39,5 en un test de 132 ejemplos | Apache-2.0 según la model card | HuggingFace |
| Otros modelos de reescritura de voz de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre otras alternativas comparables de la misma categoría en la búsqueda proporcionada.

## Limitaciones y advertencias
- Sesgos conocidos: no se documentan en la información disponible.
- Riesgo de alteración de significado: la reescritura para cambiar el tono puede modificar matices, y la traducción puede introducir errores.
- Error en aritmética temporal: por ejemplo, «九点开始，推迟一个半小时» puede convertirse en las once en lugar de las diez y media.
- Eliminación indebida de «然后» con valor semántico al inicio de frase, al confundirlo con una muletilla.
- Errores de pinyin en nombres chinos con caracteres poco frecuentes al transliterar al inglés.
- Solo se declaran chino e inglés; no hay datos de rendimiento en castellano ni en otros idiomas.
- No es un modelo de reconocimiento de voz ni procesa audio: consume texto ASR, aunque las etiquetas incluyan `speech-to-text`.
- Requiere usar literalmente los prompts de sistema del repositorio y desactivar el modo thinking; si no, puede emitir razonamiento antes de la respuesta.
- La longitud de contexto documentada es la del ejemplo de llama-server (4096 tokens); no se especifica la máxima nativa y los textos largos pueden truncarse.
- El entrenamiento usa datos sintéticos y la evaluación se limita a 152 ejemplos; la comparación con el modelo base se hizo sobre un conjunto de prueba distinto y más pequeño.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, código, matemáticas avanzadas, visión ni audio.
- Licencia Apache-2.0, igual que el modelo base según la model card; no se documentan restricciones adicionales para uso comercial.

## Enlaces
- [HuggingFace: ThermalEX/voxflow-rewrite](https://huggingface.co/ThermalEX/voxflow-rewrite)
- [Archivo q8_0 etiquetado como v4](https://huggingface.co/ThermalEX/voxflow-rewrite/resolve/v4/voxflow-rewrite-q8_0.gguf)
- [Modelo base Qwen/Qwen3.5-2B](https://huggingface.co/Qwen/Qwen3.5-2B)
- [Repositorio VoxFlow](https://github.com/ThermalEX/VoxFlow)
- [Prompts de reescritura](https://github.com/ThermalEX/VoxFlow/blob/main/voxflow/rewrite_prompts.py)
- [Registro de investigación y comparación de versiones](https://github.com/ThermalEX/VoxFlow/blob/main/docs/research-log.md)
- [llama.cpp](https://github.com/ggml-org/llama.cpp)
