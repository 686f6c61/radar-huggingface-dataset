# ternary/Arbiter-8B-GGUF

## Resumen

Arbiter-8B-GGUF es la distribución en formato GGUF del modelo Arbiter-8B (v0.5), un modelo de decisión especializado en gestión de patrimonios y activos financieros, desarrollado por el usuario ternary. Se trata de un ajuste fino de Qwen/Qwen3-8B que conserva la arquitectura, el tokenizador y la plantilla de chat de Qwen3, por lo que cualquier runtime compatible con GGUF de Qwen3 puede ejecutarlo. El modelo lee texto financiero (noticias, titulares, fragmentos de formularios 10-K de la SEC, comunicados de bancos centrales) y responde a una pregunta tipada sobre una entidad nombrada, devolviendo únicamente la letra de la opción elegida.

La propuesta del modelo no es la generación libre de texto, sino la clasificación cerrada y determinista: se le proporciona una evidencia textual, un criterio y un conjunto de opciones, y emite un único token correspondiente a la letra de la opción seleccionada. Esta restricción lo hace adecuado para pipelines de extracción de señales financieras estructuradas, donde la latencia y la consistencia importan más que la expresividad. El repositorio GGUF incluye cinco cuantizaciones (Q4_K_M, Q5_K_M, Q6_K, Q8_0 y F16), con la Q4_K_M como opción recomendada al quedar a menos de un punto de F16 en todos los benchmarks publicados.

El modelo tiene 8.190.735.360 parámetros totales y una licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. La versión GGUF sustituye a los ficheros v0.4 y está pensada para su despliegue en llama.cpp, Ollama y LM Studio. Es relevante ahora porque ofrece una alternativa local y de código abierto a APIs propietarias de decisión financiera, con métricas de precisión publicadas frente a SEntFiN, EDT y FOMC.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino de Qwen/Qwen3-8B |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (los ejemplos de uso emplean `-c 4096`) |
| Tipos de cuantización | Q4_K_M (5,0 GB), Q5_K_M (5,9 GB), Q6_K (6,7 GB), Q8_0 (8,7 GB), F16 (16,4 GB) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base publica safetensors con cabeza de decisión |
| Modelo base | ternary/Arbiter-8B (v0.5), derivado de Qwen/Qwen3-8B |
| Tamaño del repositorio | 85,4 GB |
| Descargas | 595 |
| Likes | 1 |

## Arquitectura y entrenamiento

Arbiter-8B mantiene la arquitectura transformer decoder-only de Qwen3-8B, junto con su tokenizador y su plantilla de chat. El ajuste fino convierte el modelo generalista en un clasificador de decisión guiado por prompt: recibe un objeto JSON con `evidence` (el texto literal), `criterion` (la pregunta seguida de `Focus entity: <entity>.`) y `options` (cada una con `letter` y `description` en formato `<option id>: <definition>`), y se le fuerza a generar un único token con la letra de la opción elegida, con el modo de razonamiento (thinking) desactivado.

El autor describe el modelo como «Jev-inspired», en referencia a un estilo de decisión estructurada. El entrenamiento cubre familias de preguntas concretas: tipo de evento de noticias, perspectiva (outlook), certeza, sujeto principal, rol, riesgo en formularios 10-K, estado legal y flags de presentación, eventos corporativos de EDT, postura de política monetaria y sentimiento de titulares de FOMC. Cada pregunta de la versión v0.5 aparece en una redacción original y en una versión «tightened» (más estricta). Las cuantizaciones Q4_K_M, Q5_K_M y Q6_K se generaron con una importance matrix calculada a partir de prompts de decisión reales muestreados de todas las familias de preguntas de entrenamiento; según el autor, en el modelo base esa matriz aportó 5 puntos a 4 bits (SEntFiN tightened 75,3 % frente a 70,2 % sin ella). No se detalla en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset, ni si hubo RLHF o DPO.

Una innovación destacable es la cabeza de decisión del repositorio principal (no incluida en los ficheros GGUF), que junto con la calibración por pregunta corrige la sobreconfianza de las probabilidades emitidas por el runtime GGUF. El modelo está diseñado para funcionar con las definiciones exactas de pregunta publicadas en `questions.py` y con un máximo de 16 opciones.

## Capacidades

- Clasificación de decisión cerrada: elige exactamente una opción entre las proporcionadas y responde solo con su letra mayúscula, sin explicación ni razonamiento.
- Lectura de texto financiero: noticias, titulares, pasajes de formularios SEC 10-K y comunicados de bancos centrales.
- Extracción de señales tipadas: tipo de evento de noticias, perspectiva, certeza, sujeto principal, rol, riesgo en 10-K, estado legal, flags de presentación, eventos corporativos EDT, postura de política monetaria (FOMC) y sentimiento de titulares.
- Estimación de confianza: la log-probabilidad de la letra elegida se interpreta como confianza del modelo (con las salvedades de calibración indicadas en la model card).
- Integración con endpoints compatibles con OpenAI a través de `llama-server` (`/v1/chat/completions`), con `logprobs` y `top_logprobs`.
- Multilingüe: no; el modelo está entrenado y declarado únicamente para inglés.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente o razonamiento multi-paso: no; el modelo está diseñado para una única decisión de un token, con thinking desactivado.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Clasificación de titulares financieros en tiempo real: el modelo recibe el titular como `evidence` y una pregunta de tipo de evento o sentimiento con sus opciones, y devuelve la letra de la categoría. Es adecuado porque la inferencia de un solo token mantiene la latencia baja y el formato de salida es trivial de parsear.
- Análisis de comunicados de la Reserva Federal: con la familia de preguntas FOMC, se puede etiquetar la postura de política monetaria (hawkish, neutral, dovish) de fragmentos de declaraciones, y usar la log-probabilidad como señal de confianza para priorizar revisión humana.
- Extracción de riesgos en formularios 10-K: dado un pasaje de la sección de factores de riesgo, el modelo responde a preguntas tipadas sobre riesgo, estado legal o flags de presentación, lo que permite construir un índice estructurado de riesgos por empresa y ejercicio.
- Detección de eventos corporativos: con las definiciones de EDT, el modelo clasifica eventos societarios (fusiones, dividendos, cambios de directiva) a partir de notas de prensa, alimentando bases de datos de eventos para análisis cuantitativo.
- Enriquecimiento de pipelines de gestión de patrimonios: integrado en un proceso ETL que procesa flujos de noticias, el modelo añade etiquetas de perspectiva, certeza y sujeto principal a cada documento, lo que facilita el filtrado y la priorización de carteras.
- Señal de decisión local y auditable: al ejecutarse con llama.cpp u Ollama en infraestructura propia y con licencia Apache 2.0, permite desplegar clasificación financiera sin enviar datos a APIs externas, algo relevante para cumplimiento y confidencialidad.
- Control de calidad y calibración: usando `logprobs` en el endpoint compatible con OpenAI, se pueden derivar umbrales de confianza para enrutar casos dudosos a revisión manual, aunque para probabilidades calibradas el autor recomienda el repositorio principal con transformers y la cabeza de decisión.

## Benchmarks y rendimiento

| Modelo / build | SEntFiN (14.329) | EDT (1.933) | FOMC (496) |
|---|---|---|---|
| Arbiter v0.5, Q4_K_M | 77,4 % | 93,6 % | 67,3 % |
| Arbiter v0.5, Q8_0 | 76,7 % | 93,6 % | 66,9 % |
| Arbiter v0.5, F16 | 76,8 % | 93,7 % | 66,3 % |
| Arbiter v0.5 con cabeza de decisión (repo principal) | 76,4 % | 94,2 % | 67,5 % |
| Arbiter v0.4, Q4_K_M | 75,3 % | 88,1 % | 58,5 % |
| Qwen3-8B, F16, sin ajuste fino | 75,0 % | 89,3 % | 55,0 % |

Condiciones declaradas por el autor: llama.cpp, temperatura 0, un token de salida, definiciones originales. EDT y FOMC se evalúan sobre sus splits de test reservados; SEntFiN no se usó en entrenamiento. Semianchos de confianza al 95 %: SEntFiN ±0,7, EDT ±1,1, FOMC ±4,2 puntos.

Calibración: al leer la log-probabilidad de la letra como confianza, el build F16 con más del 99 % de confianza acierta entre el 91,5 % y el 92,6 % de las veces, frente al 59,9 %–90,2 % de Qwen3-8B base. El autor advierte que la lectura GGUF está sobreconfiada en SEntFiN y FOMC (expected calibration error 0,139 y 0,167 en F16; EDT 0,037), y que la cabeza de decisión y la calibración por pregunta del repositorio principal lo corrigen (0,078, 0,067 y 0,012).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,0 GB para Q4_K_M, 5,9 GB para Q5_K_M, 6,7 GB para Q6_K, 8,7 GB para Q8_0 y 16,4 GB para F16, a los que hay que sumar el overhead de contexto y del runtime.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM puede ejecutar Q4_K_M; para Q8_0 se recomiendan 12 GB o más; para F16, 24 GB o más. En entornos de servidor, A100 y H100 son adecuadas, aunque el tamaño del modelo no las exige.
- Cabe en GPU consumer: sí, en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080 y RTX 4090 con las cuantizaciones Q4_K_M a Q8_0.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama (`ollama run hf.co/ternary/Arbiter-8B-GGUF:Q4_K_M`) y LM Studio, entre otros runtimes GGUF. El repositorio principal con cabeza de decisión requiere transformers.
- Latencia y throughput: no disponibles en la información proporcionada. El diseño de un único token de salida con temperatura 0 mantiene la generación al mínimo, pero no se publican cifras de latencia ni de tokens por segundo.
- Contexto de ejecución: los ejemplos del autor usan `-c 4096`; no se especifica la longitud de contexto nativa del modelo base.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SEntFiN | EDT | FOMC | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Arbiter-8B-GGUF (Q4_K_M) | 8,19 B | no disponible | 77,4 % | 93,6 % | 67,3 % | Apache 2.0 | GGUF en Hugging Face |
| Arbiter-8B v0.5 (repo principal, con cabeza) | 8,19 B | no disponible | 76,4 % | 94,2 % | 67,5 % | Apache 2.0 | safetensors + transformers |
| Qwen3-8B (sin ajuste fino, F16) | 8 B | no disponible | 75,0 % | 89,3 % | 55,0 % | Apache 2.0 | safetensors y GGUF |
| Jev 1.14 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | el autor remite al repositorio principal para la comparación |
| OpenAI Decisions API | no disponible | no disponible | no disponible | no disponible | no disponible | propietaria | API de pago |

La comparación con Jev 1.14 y con la OpenAI Decisions API se publica en el repositorio principal, pero los valores concretos no están incluidos en la información disponible.

## Limitaciones y advertencias

- El recall de ensayos clínicos de EDT cayó al 54,8 % en la versión v0.5, según el propio autor.
- Arbiter infravalora los titulares neutros (under-calls neutral headlines), lo que puede sesgar la distribución de etiquetas hacia opciones no neutras.
- El modelo está entrenado únicamente en inglés; no se declara soporte para otros idiomas.
- La salida está restringida a una letra de opción: no genera explicaciones, justificaciones ni texto libre, lo que limita su uso en tareas conversacionales.
- Funciona mejor con las definiciones exactas de pregunta publicadas en `questions.py` y con un máximo de 16 opciones; desviarse de ese formato degrada la precisión.
- Las probabilidades del runtime GGUF están sobreconfiadas en SEntFiN y FOMC (ECE 0,139 y 0,167 en F16); para probabilidades calibradas hay que usar el repositorio principal con transformers y la cabeza de decisión.
- Riesgo de alucinación: aunque el formato de un token reduce la generación libre, la elección de letra puede ser incorrecta en evidencias ambiguas o fuera de dominio; los semianchos de confianza del FOMC (±4,2 puntos) indican incertidumbre considerable en esa familia.
- Sesgos conocidos: no se documentan sesgos específicos en la información proporcionada, más allá del sesgo de etiqueta hacia opciones no neutras.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución con atribución; no se identifican restricciones adicionales en la información disponible.
- Los ficheros Q5_K_M y Q6_K no están benchmarkeados, por lo que su precisión real no está verificada.
- El modelo no está pensado para asesoramiento financiero directo; las decisiones deben validarse con revisión humana y fuentes adicionales.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ternary/Arbiter-8B-GGUF
- Modelo base (repo principal, con cabeza de decisión): https://huggingface.co/ternary/Arbiter-8B
- Modelo Qwen3-8B original: https://huggingface.co/Qwen/Qwen3-8B
- Limitaciones del modelo base: https://huggingface.co/ternary/Arbiter-8B#limitations
- Definiciones de preguntas (`questions.py`): https://huggingface.co/ternary/Arbiter-8B (referenciado en el repositorio principal)
