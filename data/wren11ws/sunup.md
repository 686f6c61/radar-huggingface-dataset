# wren11ws/sunup

## Resumen

Scansion-LM (publicado en Hugging Face como `wren11ws/sunup`) es un modelo de lenguaje causal especializado en la generación de letras de canciones en inglés con estructura métrica y rímica controlada, pensado para el modo Custom de Suno Studio V6. Está desarrollado por el usuario `wren11ws` y se presenta como el componente central de un arnés de entrenamiento denominado "Scansion-LM Foundry", que incluye utilidades de extracción de métrica, tokenización, fine-tuning, evaluación y exportación.

Técnicamente es un fine-tune de `distilbert/distilgpt2`, un transformer decoder-only de 6 capas, 768 dimensiones de embedding y 12 cabezas de atención, con 81.914.880 parámetros totales y un vocabulario BPE de 50.257 tokens. La longitud de contexto nativa es de 1.024 tokens, aunque el autor indica que el entrenamiento se realizó con una ventana de 256 tokens.

Su relevancia es acotada y muy específica: no compite como modelo de propósito general, sino que aborda la generación de letras con esquemas de rima y pies métricos consistentes, un problema que los modelos base pequeños resuelven mal por falta de señal estructural. Con 722 descargas y 1 like en el momento de la consulta, es un proyecto de nicho orientado a creadores que trabajan con prompts estructurados de Suno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT2LMHeadModel), 6 capas, 768 dim, 12 cabezas |
| Parametros totales | 81.914.880 (81,9 M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens (ventana de entrenamiento de 256 tokens) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers/GGUF no documentada por el autor) |
| Idiomas soportados | Inglés (`en` segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint de ~327 MB; repo de 1,3 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tune directo de `distilgpt2`, es decir, un transformer decoder-only con atención causal estándar, sin mecanismos de atención lineal, decodificación especulativa ni arquitecturas híbridas. La configuración declarada en el checkpoint es de 6 capas, 768 dimensiones de embedding, 12 cabezas de atención y un vocabulario de 50.260 tokens (la model card indica 50.257 en la tabla y 50.260 en el bloque de checkpoint, una discrepancia menor del propio autor). Se carga con Transformers estándar mediante `AutoModelForCausalLM`, sin `auto_map` ni código personalizado.

El entrenamiento se realizó sobre extractos de letras originales y limpias, con 3.500 ejemplos y 300 pasos completados (300/300), alcanzando una pérdida de entrenamiento media de 4,0097. No se documenta el número total de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste por preferencias. La innovación declarada no está en la arquitectura sino en el pipeline: extracción de pies métricos, esquemas de rima y secciones, tokenización con el tokenizer de GPT-2 y fine-tuning causal orientado a producir líneas rítmicas conformes a las reglas de scansion de Suno Studio V6.

## Capacidades

- Generación de texto causal en inglés con formato de prompt estructurado (`Title:`, `Idea:`, `Verse:`, `Chorus:`).
- Generación de letras de canciones con densidad de rima y estructura métrica aprendida del corpus de entrenamiento.
- Producción de secciones líricas diferenciadas (verso, estribillo) a partir de una idea temática.
- Extracción de métrica, pies y esquemas de rima mediante el endpoint `/extract` del sidecar HTTP (funcionalidad del arnés, no del modelo en sí).
- Ingesta por lotes de nuevas letras y reentrenamiento mediante los endpoints `/ingest-batch` y `/train` del sidecar en el puerto 8099.
- Generación autoregresiva con parámetros de muestreo configurables (temperatura, `max_new_tokens`, `pad_token_id`, `eos_token_id`).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe no disponible: el modelo está etiquetado únicamente para inglés.

## Casos de uso

- Generación de letras para Suno Custom Mode: el modelo acepta un prompt con título, idea y etiqueta de sección, y devuelve líneas en inglés con rima y métrica consistentes, lo que encaja directamente con el flujo de trabajo de la herramienta para la que fue entrenado.
- Prototipado rápido de estribillos: con `max_new_tokens` bajo (40-80) y temperatura en torno a 0,85, se pueden generar varias alternativas de estribillo para una misma idea y seleccionar la mejor, aprovechando la ventana de 256 tokens usada en entrenamiento.
- Asistencia a compositores no angloparlantes: dado que el modelo solo genera inglés, se usa como generador de borradores que el autor luego adapta o traduce, apoyándose en la estructura de secciones que el modelo reproduce de forma fiable.
- Herramienta educativa de métrica y rima: combinado con el endpoint `/extract` del arnés, permite analizar letras existentes en pies y esquemas de rima y compararlas con las generadas por el modelo, útil en talleres de escritura creativa.
- Generación por lotes para catálogos musicales: el sidecar HTTP permite lanzar peticiones a `/infer` de forma programática, de modo que un pipeline puede producir decenas de borradores por tema para una biblioteca de canciones.
- Filtrado y curación de corpus: el endpoint `/ingest-batch` permite incorporar letras nuevas al corpus `user_extracts.jsonl` y reentrenar el modelo, lo que sirve para adaptar el estilo a un género o artista concreto dentro de un proyecto de investigación.
- Experimentación con modelos pequeños: por su tamaño (81,9 M de parámetros) y licencia Apache 2.0, es adecuado como banco de pruebas para estudiar cómo el fine-tuning sobre datos estructurados afecta a la métrica y la rima en modelos GPT-2 pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de entrenamiento: pérdida media de 4,0097 tras 300 pasos sobre 3.500 ejemplos. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones específicas de calidad lírica, rima o métrica.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, el checkpoint ocupa aproximadamente 327 MB, por lo que la inferencia requiere menos de 1 GB de VRAM en la práctica (pesos más caché de activaciones y KV para 1.024 tokens).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior ejecuta el modelo con holgura. También funciona en CPU para generación de pocos cientos de tokens.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU con al menos 2 GB de VRAM, e incluso en iGPU y CPU.
- Opciones de despliegue: Transformers estándar (documentado por el autor), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repo), y el sidecar HTTP propio en el puerto 8099. No se documenta compatibilidad explícita con vLLM, llama.cpp u Ollama, aunque al ser un GPT-2 estándar es probable que sea convertible a GGUF; el autor no lo confirma.
- Latencia y throughput estimados: no disponibles. Por el tamaño del modelo, se espera latencia de milisegundos por token en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Scansion-LM (`wren11ws/sunup`) | 81,9 M | 1.024 tokens | Letras con métrica y rima para Suno | Apache 2.0 | Hugging Face, 722 descargas |
| distilgpt2 (modelo base) | 82 M | 1.024 tokens | Generación de texto general en inglés | Apache 2.0 | Hugging Face, ampliamente usado |
| GPT-2 small | 124 M | 1.024 tokens | Generación de texto general en inglés | MIT | Hugging Face |
| Modelos de letras de mayor tamaño | No disponible | No disponible | Generación lírica | No disponible | No disponible |

La comparación relevante es con su propio modelo base: Scansion-LM no supera a distilgpt2 en capacidades generales y de hecho su pérdida de entrenamiento (4,01) refleja un ajuste sobre un corpus muy estrecho, lo que probablemente degrada su rendimiento fuera del dominio lírico. Frente a GPT-2 small, ofrece menos parámetros pero una especialización que el modelo original no tiene. No se dispone de datos de benchmarks que permitan comparar calidad de rima o métrica con alternativas.

## Limitaciones y advertencias

- Modelo muy pequeño (81,9 M de parámetros) entrenado con solo 300 pasos y 3.500 ejemplos: la pérdida de 4,01 es alta y sugiere un ajuste limitado; es probable que la coherencia a nivel de canción completa sea baja.
- Ventana de entrenamiento de 256 tokens frente a un contexto nativo de 1.024: las generaciones largas pueden degradarse más allá de la ventana usada en entrenamiento.
- Solo inglés: no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Riesgo de alucinación y de reproducción de fragmentos del corpus de entrenamiento, con posibles implicaciones de derechos de autor si las letras originales no eran libres; la model card afirma que son "extractos originales y limpios", pero no se aporta verificación.
- Sesgos: no se documenta ningún análisis de sesgos; al entrenarse sobre letras de un dominio concreto, puede reproducir estereotipos temáticos y de género presentes en el corpus.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base distilgpt2 también es Apache 2.0, por lo que no hay restricciones adicionales conocidas; aun así, conviene verificar el archivo `LICENSE` del repo.
- El arnés "Scansion-LM Foundry" se distribuye con instrucciones para PowerShell y un sidecar HTTP en `127.0.0.1:8099`; no se documenta su licencia por separado ni su madurez, y los endpoints `/train`, `/ingest-batch` e `/infer` no incluyen especificaciones de seguridad, autenticación ni límites de tasa.
- No apto para producción como modelo de propósito general: su uso previsto es la generación de borradores líricos asistidos, no tareas de razonamiento, código o atención al cliente.
- Discrepancia menor en la model card entre el tamaño de vocabulario declarado (50.257 frente a 50.260) que conviene tener en cuenta al integrar el tokenizer.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wren11ws/sunup
- Modelo base: https://huggingface.co/distilbert/distilgpt2
- Documentación de Transformers para GPT-2: https://huggingface.co/docs/transformers/model_doc/gpt2
- Suno Studio: https://suno.com
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales asociados al modelo.
