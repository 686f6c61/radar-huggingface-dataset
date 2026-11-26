# viczx/opslens-17m

## Resumen

OpsLens-17M es un modelo de lenguaje de 17.052.672 parámetros desarrollado por el usuario viczx y publicado en Hugging Face. Se trata de un transformer decoder-only compatible con Llama, entrenado desde cero para una tarea muy concreta: convertir una línea de log de servidor en bruto en un objeto JSON estructurado que incluye plantilla, variables, severidad, indicador de anomalía, etiqueta de incidente, explicación en inglés y pasos de remediación. El modelo se distribuye con licencia MIT y está pensado para ejecutarse íntegramente en local, incluso en CPU.

Su relevancia radica en el tamaño extremadamente reducido (65 MB en fp32) combinado con un rendimiento alto en plantillas conocidas: alcanza un exact match de plantilla de 0,997 en líneas de test de plantillas vistas, frente al 0,355 de un baseline Drain con búsqueda en base de conocimiento. Está especializado en cinco sistemas de log (Apache, OpenSSH, Linux, HDFS y OpenStack) y forma parte de una arquitectura mayor denominada OpsLens, que encadena normalización, caché de plantillas, este modelo, anclaje a base de conocimiento y grafos de incidentes basados en reglas.

El modelo está entrenado únicamente en inglés y su ventana de contexto es de 512 tokens (aunque soporta hasta 1024 posiciones). No es un modelo de propósito general: es una herramienta de parsing y triaje de logs para entornos AIOps y de seguridad con requisitos de despliegue on-premise y sin conectividad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, compatible con Llama (RMSNorm pre-norm, RoPE, SwiGLU, embeddings atados) |
| Parametros totales | 17.052.672 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens entrenados; 1024 posiciones soportadas |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32 safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (65 MB en fp32) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 8 capas, dimensión de modelo 384, 6 cabezas de atención (dimensión de cabeza 64) y MLP de 1024. Usa RMSNorm pre-norm, RoPE, activación SwiGLU y embeddings atados. El vocabulario es un BPE a nivel de byte de 7.527 tokens entrenado desde cero, con los dígitos separados en tokens individuales, lo que facilita la copia exacta de valores numéricos en las variables. El contexto de entrenamiento es de 512 tokens.

El entrenamiento se realizó en dos fases. Primero, preentrenamiento por predicción del siguiente token sobre 100 millones de tokens de líneas en bruto de Loghub-2.0 (pérdida de validación 0,67). Después, ajuste fino supervisado sobre pares (línea → JSON) construidos a partir de una base de conocimiento de 499 entradas redactada por un modelo profesor (Claude), incluyendo copias con palabras constantes sustituidas para que el modelo aprenda a copiar en lugar de memorizar. Todo el proceso se completó en aproximadamente 1,5 horas en una única GPU RTX 3050 Laptop de 4 GB. No se documenta uso de RLHF ni DPO.

La innovación técnica principal no está en la arquitectura, sino en el denominado decodificador OpsLens, que restringe la plantilla generada a la línea de entrada con huecos `<*>` y copia las variables de forma exacta byte a byte. Este decodificador mejora el parsing de plantillas no vistas respecto a la decodificación greedy simple.

## Capacidades

- Parsing de líneas de log: genera la plantilla con huecos `<*>` y extrae las variables copiadas byte a byte.
- Clasificación de severidad (`s`) e indicador de anomalía binario (`a`).
- Etiquetado de incidentes (`g`), por ejemplo `ssh_bruteforce`.
- Generación de una explicación en inglés de una frase (`m`) sobre el significado de la línea.
- Generación de hasta tres pasos de remediación (`f`) con los valores reales de la línea insertados.
- Salida estructurada en JSON con claves cortas y estables.
- Ejecución en CPU y totalmente offline, sin dependencias de red.
- No soporta tool calling, function calling, agentes multi-paso ni visión o audio.
- Capacidad monolingüe: únicamente inglés.

## Casos de uso

- Triaje automatizado de logs SSH: el modelo detecta patrones como intentos de fuerza bruta (`ssh_bruteforce`) a partir de líneas de OpenSSH y propone bloqueos de IP o desactivación del login de root, adecuado para un primer filtro en pipelines de seguridad on-premise.
- Enriquecimiento de logs en SIEM: cada línea se convierte en JSON con severidad, etiqueta de incidente y explicación, lo que permite indexar y correlacionar eventos sin enviar datos a servicios externos.
- Detección de anomalías en infraestructura: el flag `a` y la severidad permiten marcar líneas sospechosas en Apache, Linux, HDFS u OpenStack y alimentar grafos de incidentes basados en reglas.
- Asistencia a operadores de guardia: la explicación en inglés y los pasos de remediación ofrecen una primera hipótesis accionable para líneas de log poco familiares, con la advertencia de que las plantillas nuevas se marcan como baja confianza.
- Normalización y deduplicación de logs: la plantilla generada agrupa líneas equivalentes con distintas variables, útil para reducir volumen antes de almacenamiento o análisis.
- Despliegue en entornos air-gapped: al ejecutarse en CPU con 65 MB de pesos, puede integrarse en appliances o contenedores sin GPU y sin conectividad, cumpliendo requisitos de soberanía de datos.
- Prototipado rápido de pipelines AIOps: su bajo coste de entrenamiento (unas horas en una GPU de 4 GB) permite reentrenarlo para nuevos formatos de log y validar la aproximación antes de invertir en modelos mayores.

## Benchmarks y rendimiento

Resultados sobre líneas de test reservadas. "Unseen" corresponde a plantillas nunca vistas en entrenamiento (15 % de plantillas por sistema reservadas, semilla 42).

| Metrica | Seen | Unseen |
|---|---|---|
| Exact match de plantilla (PA) | 0,997 | 0,303 |
| Variables exactas | 0,997 | 0,303 |
| Precisión de agrupación | 1,000 | 0,595 |
| F1 de anomalía frente al profesor | 1,00 (memorizado) | 0,71 |
| Calidad de explicación y remediación (1–5, juez LLM) | no disponible | 2,16 |

Baseline Drain con búsqueda en base de conocimiento: PA 0,355 en seen y 0,352 en unseen, sin explicación en líneas no vistas.

Latencia en CPU (4 hilos, fp32, decodificador OpsLens): 100 ms de p50 para plantillas conocidas y aproximadamente 1,1 s para patrones nuevos, que decodifican la explicación completa.

## Requisitos de hardware

- VRAM para inferencia: no requiere GPU; 65 MB de pesos en fp32 permiten ejecución en CPU con memoria RAM mínima.
- GPU recomendadas: cualquiera con al menos 1 GB de memoria; el autor entrenó el modelo en una RTX 3050 Laptop de 4 GB.
- Cabe en cualquier GPU de consumo, incluida la RTX 3050 Laptop, y en CPU sin aceleración.
- Opciones de despliegue: transformers (referencia del autor), text-generation-inference y endpoints compatibles según los tags del repositorio; no se documentan pesos GGUF ni integración específica con llama.cpp u Ollama.
- Latencia: 100 ms de p50 en CPU para plantillas conocidas y unos 1,1 s para patrones nuevos con 4 hilos en fp32. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpsLens-17M | 17,05 M | 512 (1024 posiciones) | Parsing de logs a JSON | MIT | Hugging Face |
| Baseline Drain + KB (referencia del autor) | no aplica (algoritmo) | no aplica | Parsing por árbol de similitud | no disponible | Herramienta de código abierto |
| Modelos de propósito general tipo Llama pequeños | cientos de millones a varios miles de millones | miles de tokens | Generación general | variable | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros modelos pequeños especializados en parsing de logs en la información proporcionada. La única comparación documentada es frente al baseline Drain, donde OpsLens-17M supera ampliamente el exact match de plantilla en líneas vistas (0,997 frente a 0,355) y ofrece explicaciones que el baseline no genera en líneas no vistas.

## Limitaciones y advertencias

- Cobertura limitada a cinco sistemas de log (Apache, OpenSSH, Linux, HDFS, OpenStack); otros formatos requieren reentrenamiento.
- En plantillas no vistas el exact match cae a 0,303 y las explicaciones y remediaciones suelen ser incorrectas; el sistema OpsLens marca esas líneas como "baja confianza, patrón nuevo".
- Las etiquetas de la base de conocimiento provienen de un modelo profesor y no fueron verificadas íntegramente por humanos, por lo que pueden contener errores.
- El modelo solo recomienda; no ejecuta acciones.
- Riesgo de alucinación en la explicación y en los pasos de remediación, especialmente fuera de las plantillas entrenadas.
- Idioma único: inglés; no soporta castellano ni otros idiomas.
- Contexto corto (512 tokens entrenados), adecuado para líneas individuales pero no para bloques de log largos.
- Licencia MIT para código y pesos, lo que permite uso comercial; los datos de entrenamiento son Loghub-2.0 (Jiang et al., ISSTA 2024) y conviene revisar sus condiciones para usos derivados.
- No se documentan cuantizaciones ni pesos GGUF, lo que limita su uso con herramientas de inferencia alternativas sin conversión previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/viczx/opslens-17m
- Dataset Loghub-2.0 (Jiang et al., ISSTA 2024): no disponible como enlace directo en la información proporcionada
- Paper de Loghub-2.0: no disponible
- Repositorio de código del sistema OpsLens: no disponible
- Demo: no disponible
