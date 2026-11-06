# Takenoko12345678/Ephedra-0.5-Cyber-Experimental-GGUF

## Resumen

Ephedra-0.5-Cyber-Experimental-GGUF es una versión cuantizada en formato GGUF del modelo Ephedra-0.5-Cyber-Experimental, un modelo experimental de revisión de código orientado a la detección defensiva de vulnerabilidades. Lo publica el usuario Takenoko12345678 y se construye integrando un LoRA de revisión de seguridad sobre el modelo base XHToken/Spark-X2.6-4B, un transformer denso de aproximadamente 4.100 millones de parámetros. El resultado se convierte a GGUF mediante llama.cpp para su uso en entornos locales.

El modelo está pensado para dos flujos de trabajo: el análisis puntual de fragmentos de código con salida JSON estructurada (campo `vulnerable`, CWE, localización y motivo) y el uso como agente de solo lectura con cuatro herramientas (`list_dir`, `read_file`, `grep` y `report`). No se trata de un modelo de propósito general, sino de un derivado especializado con etiquetas de seguridad, revisión de código y detección de vulnerabilidades.

Es relevante ahora por su carácter abierto (licencia Apache 2.0) y su bajo coste de despliegue en hardware de consumo, pero el propio autor advierte de forma explícita que es una versión experimental sin precisión práctica: como agente no emite veredicto en más del 60 % de las ejecuciones y es más débil que su checkpoint previo a la corrección de seguridad. La ficha debe leerse, por tanto, como documentación de un artefacto de investigación y no como una herramienta lista para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base XHToken/Spark-X2.6-4B con LoRA de seguridad integrado) |
| Parámetros totales | 4.112.079.360 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (configuración de referencia con `-c 32768`) |
| Tipos de cuantización | Q8_0 (4,4 GB) y Q4_K_M (2,6 GB) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (conversión desde safetensors f16 con `convert_hf_to_gguf.py` de llama.cpp, commit `7fe450e19`, build 11146) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de unos 4.100 millones de parámetros que parte de XHToken/Spark-X2.6-4B. Sobre esa base se ha integrado un LoRA orientado a la revisión defensiva de código, que posteriormente se ha fusionado con el modelo base y se ha convertido a GGUF. La model card no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron fases de RLHF o DPO; esos datos se remiten al repositorio del LoRA original.

Un detalle técnico destacable es que todo el entrenamiento se realizó sin modo de razonamiento (thinking), por lo que el autor exige usar `enable_thinking=false` en todas las peticiones. El formato de interacción esperado incluye código con números de línea (formato `   12| `) y una respuesta JSON única con los campos `vulnerable`, `cwe`, `location`, `reason` y, en algunos casos, `source`, `sink` y `missing_check`. Para el modo agente se definió un system prompt específico y un conjunto de herramientas de solo lectura, sin acceso de escritura ni ejecución de código. La evaluación se realizó íntegramente sobre Q8_0 (base Q8_0 con LoRA superpuesto).

## Capacidades

- Revisión de fragmentos de código con salida JSON estructurada para clasificación de vulnerabilidad y CWE.
- Detección de patrones de inyección (por ejemplo, SQL injection y CWE-89 en el ejemplo de la model card).
- Localización del problema por archivo y línea dentro del fragmento analizado.
- Uso como agente de solo lectura con llamadas a herramientas compatibles con la API de OpenAI (`list_dir`, `read_file`, `grep`, `report`).
- Razonamiento multi-paso limitado: seguimiento del origen de entradas a través de ficheros mediante `grep` y `read_file`.
- Rechazo parcial de peticiones de generación de código de ataque (entrenado para declinar, aunque de forma imperfecta).
- Capacidad multilingüe: no disponible; el modelo está etiquetado únicamente en inglés.
- Modo thinking: no soportado en el flujo previsto; debe desactivarse explícitamente.

## Casos de uso

- Revisión defensiva de fragmentos de código propio: el modelo recibe bloques de hasta unas 120 líneas con numeración y devuelve un JSON con veredicto y CWE, útil como primera pasada en un pipeline de revisión interna antes de la revisión humana.
- Triaje en pull requests: integrado vía llama-server con `--jinja` y `-c 32768`, puede procesar diffs por segmentos y marcar candidatos sospechosos para que un revisor humano los confirme.
- Análisis agéntico de un repositorio en solo lectura: con las cuatro herramientas definidas, el modelo puede recorrer un checkout, localizar flujos de datos desde `source` a `sink` y emitir un `report`, siempre que se acepte su alta tasa de no-veredicto.
- Formación y experimentación en seguridad: sirve como banco de pruebas para estudiar la fusión de LoRA de seguridad sobre modelos pequeños y el comportamiento de agentes con herramientas restringidas.
- Auditoría de dependencias o código heredado: el análisis por fragmentos de 120 líneas permite revisar ficheros largos de forma secuencial en local, sin enviar código a servicios externos.
- Despliegue en estaciones de trabajo con GPU de consumo: al caber en cuantización Q4_K_M (2,6 GB), permite revisiones offline en portátiles o equipos sin aceleradores de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible en el sentido habitual (MMLU, HumanEval, GSM8K). La model card únicamente aporta una métrica cualitativa de comportamiento agéntico: el modelo no emite conclusión en más del 60 % de las ejecuciones como agente y rinde peor que su checkpoint previo a la corrección de seguridad. No se proporcionan cifras de precisión, recall ni F1 sobre conjuntos de vulnerabilidades.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4,4 GB para Q8_0 y 2,6 GB para Q4_K_M, más overhead de contexto (32.768 tokens configurados en el ejemplo).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para Q8_0; para Q4_K_M basta con 4-6 GB. No se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: sí, en tarjetas de gama media con 8 GB o más en Q8_0 y en tarjetas de 6 GB en Q4_K_M; también es viable en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (build 11146 verificado, con `llama-server` y `--jinja`), LM Studio. Otras opciones como vLLM, TGI u Ollama no están confirmadas en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ephedra-0.5-Cyber-Experimental-GGUF | 4,11 B | 32.768 | Revisión de seguridad defensiva (experimental) | Apache 2.0 | GGUF en Hugging Face |
| XHToken/Spark-X2.6-4B (base) | ~4 B | no disponible | Propósito general | no disponible | Hugging Face |
| Modelos de revisión de código de propósito general | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de rendimiento de alternativas comparables, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Precisión insuficiente para uso real: el autor indica explícitamente que es una versión experimental sin precisión práctica.
- Como agente, no emite veredicto en más del 60 % de las ejecuciones y es más débil que su checkpoint previo a la corrección de seguridad.
- Falsos positivos y falsos negativos documentados; no debe usarse como única fuente para decisiones de seguridad.
- Riesgo de alucinación en la clasificación CWE y en la localización del problema.
- Idioma limitado al inglés; no se garantiza comportamiento en castellano ni en otros idiomas.
- Requiere desactivar el modo thinking (`enable_thinking=false`); usarlo activado degrada el comportamiento previsto.
- El rechazo de peticiones de código de ataque está entrenado pero no es completo.
- Uso restringido a fines defensivos (revisión de código propio o gestionado); el autor no autoriza su uso para atacar sistemas de terceros.
- Licencia Apache 2.0 permite uso comercial, pero la atribución de datos de entrenamiento se remite al repositorio del LoRA original y no está detallada aquí.
- Modelo no oficial: no está afiliado a XHToken y es un derivado no respaldado por el autor del modelo base.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Takenoko12345678/Ephedra-0.5-Cyber-Experimental-GGUF
- Modelo base del LoRA: https://huggingface.co/Takenoko12345678/Ephedra-0.5-Cyber-Experimental
- Modelo base subyacente: https://huggingface.co/XHToken/Spark-X2.6-4B
