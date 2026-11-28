# Viv0605101/anlp-a3-mamba

## Resumen

`Viv0605101/anlp-a3-mamba` es un modelo de investigación publicado en Hugging Face como parte de la asignación 3 (parte A) del curso Advanced NLP del IIIT (identificador de alumno `2024122002`). Se trata de un decodificador de cifrados (cipher decoder) construido sobre una arquitectura de tipo Mamba (modelo de espacio de estados) y entrenado para revertir un cifrado simbólico concreto a partir de un front end fijo que elimina el flujo de clave (key stream).

El modelo es muy pequeño: 3.098.918 parámetros según los pesos en safetensors del repositorio, aunque la model card declara 948.224 parámetros para la etapa entrenada durante 2.000 pasos. Esta discrepancia probablemente refleja distintas etapas del mismo experimento (ramas `rule-inputs` y `step-inputs`). El modelo no aprende la clave criptográfica: la recurrencia del front end elimina el key stream y unas tablas por posición (`sym_table`, almacenada como buffer) mapean cada símbolo a un token de letra o a un token desconocido; la red copia los tokens conocidos y rellena los desconocidos a partir del contexto decodificado.

Su relevancia es acotada y académica: no es un modelo de propósito general ni un LLM, sino una demostración de que una arquitectura de espacio de estados puede resolver una tarea de decodificación simbólica con exactitud muy alta (98,96 % en validación y 99,32 % en test según la model card). No hay información sobre licencia, idiomas, pipeline ni contexto, por lo que su uso en producción fuera del ámbito del curso no está respaldado por la documentación disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mamba (modelo de espacio de estados), con front end recurrente fijo para eliminación del key stream |
| Parámetros totales | 3.098.918 (safetensors del repo); 948.224 declarados en la model card para la etapa de 2.000 pasos |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 8-bit (según tags del repositorio) |
| Idiomas soportados | no disponible (la tarea opera sobre símbolos mapeados a tokens de letra) |
| Licencia | no disponible |
| Formato de pesos | safetensors, PyTorch (`pytorch_model_hub_mixin`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura Mamba, es decir, un modelo de espacio de estados selectivo en lugar de un transformer con atención cuadrática. La innovación principal del sistema no está en la red en sí, sino en el front end: una recurrencia fija elimina el key stream del cifrado y unas tablas por posición contadas sobre el split de entrenamiento (`sym_table`) convierten cada símbolo en un token de letra o en un token desconocido. La red neuronal se limita a copiar los tokens conocidos y a rellenar los desconocidos usando el contexto decodificado; según la model card, el modelo no aprende la clave.

El entrenamiento reportado es corto: 2.000 pasos para la etapa principal, con etapas anteriores en las ramas `rule-inputs` (entradas de candidatos por reglas) y `step-inputs` (entradas de paso y posición). No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO; tampoco se detallan innovaciones como decodificación especulativa o atención lineal más allá del propio diseño Mamba. La model card remite al informe `2024122002_a3.pdf` incluido en el repositorio y al repositorio de código del IIIT para obtener detalles completos.

## Capacidades

- Decodificación de cifrados simbólicos: revierte el cifrado eliminando el key stream mediante una recurrencia fija y mapeando símbolos a letras con tablas por posición.
- Relleno de contexto: copia los tokens conocidos y completa los desconocidos a partir del contexto decodificado.
- Manejo de tokens desconocidos: la tabla `sym_table` incluye un token de desconocido para símbolos no vistos en el split de entrenamiento.
- Evaluación por exact match, precisión de caracteres, precisión de palabras y distancia de Levenshtein (métricas reportadas en la model card).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües.
- No se documenta un modo de pensamiento (thinking mode) ni instrucciones de chat.

## Casos de uso

- Reproducción académica de la asignación: el modelo se usa con `bash scripts/part1/test_assn.sh` del repositorio del IIIT para descargar los pesos y decodificar el split de test, tal como indica la model card.
- Estudio de arquitecturas de espacio de estados: sirve como ejemplo mínimo (menos de 3,1 M de parámetros) para analizar cómo una Mamba se comporta en una tarea simbólica con front end fijo.
- Investigación sobre decodificación de cifrados: permite comparar el enfoque de tablas por posición más red neuronal frente a métodos puramente basados en reglas, usando las ramas `rule-inputs` y `step-inputs`.
- Docencia y evaluación de métricas: sus resultados por exact match, precisión de caracteres y Levenshtein son útiles para ilustrar la evaluación de tareas de secuencia a secuencia.
- Experimentos de ablación: al ser un modelo pequeño, se puede entrenar y evaluar en hardware modesto para estudiar el efecto del número de pasos o del tamaño de las tablas.
- Prototipado de pipelines de decodificación simbólica: el diseño de front end recurrente más red puede trasladarse a otros cifrados simples con tablas de símbolos, siempre dentro de un contexto de investigación.

## Benchmarks y rendimiento

Resultados reportados en la model card del autor:

| Split | Exact match (%) | Precisión de caracteres (%) | Precisión de palabras (%) | Levenshtein medio |
|---|---|---|---|---|
| Validación | 98,96 | 99,998 | 99,97 | 0,016 |
| Test | 99,32 | 99,988 | 99,58 | 0,108 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para 3,1 M de parámetros (unos 12 MB de pesos); en 8-bit, aún menos. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU moderna, incluidas GTX 1050, RTX 3060, RTX 4090, A100 o H100; el cuello de botella no será la VRAM sino el front end y el código de decodificación.
- Cabe en GPU consumer: sí, en todas las gamas actuales, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch nativo con `pytorch_model_hub_mixin`; no se documenta soporte de vLLM, llama.cpp, Ollama o TGI, que además no aplican a este tipo de modelo simbólico.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de decodificación de cifrados con arquitectura Mamba ni alternativas de la misma categoría con datos públicos de parámetros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- El modelo no aprende la clave criptográfica: depende de un front end recurrente fijo y de tablas por posición calculadas sobre el split de entrenamiento, por lo que no generaliza a cifrados distintos sin rehacer ese front end.
- Los símbolos no vistos en entrenamiento se mapean al token desconocido y se rellenan por contexto, lo que puede degradar la precisión fuera de la distribución del split.
- La model card declara 948.224 parámetros mientras que los safetensors del repositorio suman 3.098.918; conviene verificar qué etapa corresponde a cada rama antes de reutilizar los pesos.
- No hay licencia declarada, lo que impide asumir permisos de uso comercial o redistribución.
- No hay información sobre sesgos, idiomas, contexto máximo ni riesgos de alucinación en el sentido habitual de un LLM; el riesgo principal es la decodificación incorrecta de símbolos desconocidos.
- Es un artefacto académico sin pipeline declarado ni documentación de producción; no se recomienda su uso fuera de entornos de investigación o docencia.
- El repositorio tiene un tamaño de 0,0 GB y muy pocas descargas (174) y likes (0), lo que sugiere escasa validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Viv0605101/anlp-a3-mamba
- Repositorio de código y resultados (IIIT): https://code.iiit.ac.in/advanced-nlp/m26-assignment3-vidvathama.babu (commit a5ab590)
- Informe incluido en el repositorio: `2024122002_a3.pdf`
- Ramas con etapas anteriores: `rule-inputs` y `step-inputs` en el mismo repositorio de Hugging Face
