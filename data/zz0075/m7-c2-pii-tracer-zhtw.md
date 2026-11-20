# ZZ0075/M7-C2-PII-Tracer-zhTW

## Resumen

M7-C2-PII-Tracer-zhTW es un modelo de clasificación de tokens (token classification) para la detección de información personal identificable (PII) en chino tradicional, especializado en el dominio de seguros de Taiwán. Lo desarrolla el usuario ZZ0075 como parte de un ejercicio de investigación sobre desidentificación denominado pii-drill, y se construye como un fine-tuning de perplexity-ai/PII-Tracer, al que se sustituye la cabeza de clasificación por una nueva con 11 tipos de entidad propios del sector asegurador taiwanés.

El modelo resuelve un problema acotado pero crítico en entornos regulados: localizar nombres, números de identificación, fechas de nacimiento, teléfonos, correos, direcciones, números de cuenta, números de póliza, empleadores y datos de salud en conversaciones y formularios de suscripción de seguros. Al ser un modelo de extracción de spans (no generativo), su inferencia es determinista y puede ejecutarse en CPU, lo que facilita su integración en pipelines de desidentificación previos a almacenamiento o análisis.

Es relevante ahora porque la mayoría de detectores PII publicados están optimizados para inglés o chino simplificado, y el chino tradicional con jerga aseguradora presenta patrones léxicos y de formato distintos. No obstante, el propio autor advierte que la línea de seguridad no se ha superado y que el modelo solo se ha evaluado sobre datos sintéticos, por lo que debe tratarse como un componente de investigación y no como una defensa lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (base perplexity-ai/PII-Tracer) con cabeza de clasificación de tokens lineal y decodificación Viterbi |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | max_len de entrenamiento 1024 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, inferencia en float32) |
| Idiomas soportados | chino tradicional (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (m7c2_v9r.safetensors) |

## Arquitectura y entrenamiento

El modelo parte de perplexity-ai/PII-Tracer (revisión `d25c16f2e57e321f6d2527715c01df9112f956f5`), un encoder tipo transformer para token classification. Sobre esa base se reemplaza la cabeza de clasificación por una `nn.Linear` de dimensión `hidden_size` a 45 etiquetas: la clase `O` más 11 tipos de entidad, cada uno con esquema BIES (Begin, Inside, End, Single). La decodificación de spans se realiza con un decodificador de Viterbi que incorpora sesgos `viterbi_b_bias` y `viterbi_e_bias` para forzar transiciones coherentes entre etiquetas.

El entrenamiento se realizó exclusivamente con datos sintéticos de chino tradicional: diálogos de negocio asegurador y fragmentos de solicitudes de póliza generados por un generador independiente del usado en la evaluación. Se usaron 6.000 ejemplos de entrenamiento y 600 de validación, 2 épocas, learning rate de 2e-5 para el cuerpo y 5e-4 para la cabeza, acumulación de gradiente 4 y `max_len` de 1024, sobre una GPU Colab L4. No se emplearon datos personales reales ni conversaciones reales, y el dataset no se publica. No se documenta uso de RLHF ni DPO, por tratarse de una tarea de etiquetado supervisado.

## Capacidades

- Detección de 11 tipos de PII en chino tradicional: nombre, apodo, número de identificación, fecha de nacimiento, teléfono, email, dirección, número de cuenta, número de póliza, empleador y datos de salud.
- Etiquetado a nivel de token con esquema BIES y decodificación Viterbi para producir spans coherentes.
- Inferencia en CPU, sin necesidad de GPU.
- Procesamiento de conversaciones multi-turno y fragmentos de formularios hasta 1024 tokens.
- Integración con la pila de Hugging Face (`AutoModel`, `trust_remote_code`, `safetensors`).
- Diseñado para combinarse con una capa de reglas y comparación de valores conocidos (denominada J2 en la documentación del autor).
- No soporta generación de texto, tool calling, agentes, visión ni audio: es un extractor de entidades.

## Casos de uso

- Desidentificación previa al almacenamiento en aseguradoras: el modelo detecta y enmascara números de póliza, identificadores y datos de salud en transcripciones de atención al cliente antes de persistirlas en bases de datos analíticas.
- Cumplimiento normativo en flujos de suscripción: procesar fragmentos de solicitudes de póliza para localizar identificadores y direcciones y verificar que no se propagan a sistemas no autorizados.
- Anonimización de datasets para investigación: aplicar el extractor sobre corpus sintéticos o internos de chino tradicional para generar versiones libres de PII antes de compartirlas con equipos de ciencia de datos.
- Filtro de fuga en herramientas de soporte: ejecutar el modelo como capa adicional en asistentes internos que redactan respuestas, bloqueando la salida cuando se detecta un span de PII con confianza superior al umbral (0,95 en la configuración del autor).
- Auditoría de registros históricos: barrido por lotes de conversaciones archivadas para inventariar qué tipos de PII contienen y priorizar su purga o cifrado.
- Componente de un pipeline híbrido de DLP: combinarlo con reglas y diccionarios de valores conocidos (la "línea J2") para reducir falsos negativos en apodos y datos de salud, que son las categorías con más fugas en la evaluación del autor.
- Etiquetado asistido para entrenar modelos mayores: usar sus spans como preetiquetado en la construcción de datasets de PII en dominios regulados de Taiwán.

## Benchmarks y rendimiento

Resultados de validación reportados por el autor (F1, conjunto de validación que comparte plantillas de frase con el entrenamiento, por lo que el propio autor los califica de optimistas):

| Tipo de entidad | F1 (validación) |
|---|---|
| Nombre | 0,96 |
| Apodo | 0,87 |
| Número de identificación | 0,96 |
| Fecha de nacimiento | 0,98 |
| Teléfono | 0,92 |
| Email | 0,96 |
| Dirección | 0,99 |
| Número de cuenta | 0,98 |
| Número de póliza | 0,99 |
| Empleador | 0,94 |
| Datos de salud | 0,85 |

Evaluación sobre pii-drill v9 test (60 diálogos sintéticos, ejecución única), con la línea J2 (reglas + comparación de valores conocidos + correcciones de diseño + este modelo, umbral 0,95):

| Métrica | Valor |
|---|---|
| Fugas de PII con defensa | 58 (10 valores únicos, principalmente apodos y datos de salud) |
| Fugas de PII sin defensa | 3.500 |
| Mensajes sin PII bloqueados por error | 0,63 % |
| Latencia P95 de la capa de envío en CPU | 4,56 s (Colab, 2 vCPU) |

No se han publicado resultados comparativos con MMLU, HumanEval, GSM8K ni otros benchmarks generales en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión al no publicarse el número de parámetros; el repositorio ocupa 1,2 GB, lo que sugiere un modelo de tamaño moderado que cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de memoria; el autor entrenó en una NVIDIA L4 de Colab.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares, aunque el dato exacto de VRAM no está documentado.
- Despliegue: la model card solo documenta inferencia con PyTorch y `transformers` en CPU; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (y al ser un encoder de clasificación, no todos estos motores son aplicables).
- Latencia: P95 de 4,56 s por petición en CPU (2 vCPU de Colab), por encima del objetivo de 3 s fijado por el autor. No se publican datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Tarea | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| M7-C2-PII-Tracer-zhTW | Token classification PII (11 tipos, dominio seguros) | zh (tradicional) | 1024 | MIT | Hugging Face |
| perplexity-ai/PII-Tracer | Token classification PII (modelo base) | no disponible | no disponible | MIT | Hugging Face |
| Ministral-3B-PII | Detección PII comparada en la demo del autor | no disponible | no disponible | no disponible | Referenciado en la demo del autor |

No se dispone de datos de rendimiento de los modelos comparados en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- El autor declara explícitamente que la línea de seguridad no se ha superado y que el modelo no es una defensa desplegable en producción.
- Solo se ha evaluado sobre datos sintéticos; no hay validación con conversaciones reales ni con PII real.
- El conjunto de validación comparte plantillas de frase con el entrenamiento, por lo que los F1 reportados son optimistas.
- Persisten fugas en la evaluación: 58 detecciones fallidas, concentradas en apodos y datos de salud, las dos categorías con menor F1.
- La latencia en CPU (P95 4,56 s) supera el objetivo de 3 s del autor, lo que puede ser problemático en flujos interactivos.
- Cobertura lingüística limitada al chino tradicional; no se ha validado en chino simplificado ni en otros idiomas.
- Ventana de contexto de 1024 tokens, insuficiente para documentos largos sin troceado previo.
- Riesgo de falsos positivos: el 0,63 % de mensajes sin PII fueron bloqueados por la línea completa, no solo por el modelo.
- Licencia MIT, que permite uso comercial, pero heredada del modelo base; conviene verificar las condiciones de este último antes de un despliegue comercial.
- No se publican los datos de entrenamiento, lo que dificulta auditar la distribución de sesgos.
- No apto para generación, razonamiento ni tareas fuera de la extracción de entidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZZ0075/M7-C2-PII-Tracer-zhTW
- Modelo base: https://huggingface.co/perplexity-ai/PII-Tracer
- Demo online (incluye línea J2 y comparación con Ministral-3B-PII): https://huggingface.co/spaces/ZZ0075/M7C2-J2-PII-Demo
