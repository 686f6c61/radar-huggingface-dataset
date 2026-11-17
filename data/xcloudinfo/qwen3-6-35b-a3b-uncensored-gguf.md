# xCloudinfo/Qwen3.6-35B-A3B-Uncensored-GGUF

## Resumen

Qwen3.6-35B-A3B-Uncensored-xCloud-GGUF es una cuantización GGUF del modelo base Qwen/Qwen3.6-35B-A3B, publicada por xCloudinfo (云碩科技), una empresa centrada en soluciones de IA privadas en local. El modelo parte de una arquitectura MoE con atención lineal híbrida (identificador `qwen3_5_moe`) y capacidad de razonamiento, con 34.660.610.688 parámetros totales y aproximadamente 3B activos por token. Sobre esa base se aplica una técnica de abliteration (ortogonalización de la dirección de rechazo) para reducir el exceso de rechazos, sin reentrenamiento.

El problema que aborda es el exceso de rechazo del modelo original: según el autor, el Qwen3.6-35B-A3B base rechaza casi todas las peticiones de una batería de 10 prompts de daño grave (aproximadamente 10/10), mientras que la versión Q4_K_M de esta ficha mide 0/10 en la misma prueba ejecutada vía `llama-server`. Es relevante para desarrolladores que necesitan un modelo local con contexto largo y razonamiento para investigación de seguridad, red teaming autorizado o moderación de contenido, donde el exceso de rechazo degrada la utilidad.

La distribución es exclusivamente en formato GGUF con seis niveles de cuantización (de Q8_0 a IQ2_M), licencia Apache-2.0 heredada del modelo base, idiomas declarados chino e inglés, y sin el proyector de visión (la release es solo texto). El repositorio ocupa 141,7 GB y acumula 12.739 descargas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención lineal híbrida (identificador `qwen3_5_moe`), con modo de razonamiento |
| Parametros totales | 34.660.610.688 |
| Parametros activos | Aproximadamente 3B (según model card: 35B total / 3B activo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS (imatrix), IQ2_M (imatrix) |
| Idiomas soportados | zh, en (chino e inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors solo en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura MoE con atención lineal híbrida, es decir, combina capas de atención lineal de tipo SSM con mecanismos de atención habituales, y dispone de un modo de razonamiento (thinking). Esta release no reentrena el modelo: aplica una abliteration de dirección única según el método de Arditi et al. (2024). La dirección de rechazo se extrae fuera del segmento de thinking del modelo de razonamiento, y la ortogonalización cubre la proyección de salida de la atención lineal SSM (`out_proj`) y el `down_proj` de los expertos MoE. En total se ortogonalizan 121 matrices de pesos, limitadas a los escritores de residuo de la torre de texto.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni el proceso de alineación (RLHF/DPO) del modelo base en la información proporcionada. La única intervención documentada es la abliteration, que ajusta el comportamiento de rechazo sin modificar los juicios de valor del modelo. La cuantización se realizó con llama.cpp, con variantes imatrix para IQ4_XS e IQ2_M.

## Capacidades

- Generación de texto conversacional y de razonamiento, con modo thinking herencia del modelo base.
- Razonamiento multi-paso y resolución de problemas (capacidad declarada del base; sin benchmarks publicados en esta ficha).
- Capacidad multilingüe limitada a chino e inglés según la metadata; el autor verifica fluidez en chino tradicional.
- No incluye capacidades de visión en esta release: el proyector de visión se omitió por incompatibilidad del preprocesador del modelo base con el conversor.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Comportamiento de rechazo reducido: 0/10 en la batería de 10 prompts de daño grave del autor, medido con thinking desactivado.

## Casos de uso

- Investigación de seguridad y red teaming autorizado: el modelo permite evaluar la robustez de sistemas de moderación y filtros de contenido sin que el propio modelo bloquee las pruebas, gracias a la reducción de rechazos medida (0/10 frente a 10/10 del base).
- Moderación de contenido y anotación de datasets sensibles: permite procesar y clasificar material potencialmente dañino en pipelines de revisión, donde el exceso de rechazo del modelo original interrumpiría el flujo.
- Investigación académica sobre alineación y abliteration: sirve como caso de estudio reproducible de ortogonalización de dirección de rechazo en arquitecturas MoE híbridas, con el método y los pesos publicados.
- Despliegue local privado en chino e inglés: al ser GGUF y ejecutable con llama.cpp, encaja en entornos on-premise sin conexión, un escenario habitual de la empresa publicadora.
- Procesamiento de texto con razonamiento en local: el modo thinking del base permite tareas de análisis y respuesta razonada en máquinas sin GPU de datacenter, aprovechando que solo ~3B parámetros están activos por token.
- Generación de contenido en chino tradicional: el autor verifica fluidez y corrección sin degradación tras la cuantización, útil para tareas editoriales o de asistencia en ese idioma.
- Evaluación comparativa de cuantizaciones: la escalera de seis niveles permite medir el impacto de la cuantización en calidad y velocidad sobre el mismo modelo, útil para calibrar despliegues.

## Benchmarks y rendimiento

| Prueba | Modelo original Qwen3.6-35B-A3B | Esta versión (Q4_K_M) |
|---|---|---|
| Tasa de rechazo en 10 prompts de daño grave (held-out) | Aproximadamente 10/10 | 0/10 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica publicada es la tasa de rechazo, medida vía `llama-server` tras la cuantización, con thinking desactivado y detección de frases de rechazo en chino simplificado, chino tradicional e inglés.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; depende del nivel de cuantización elegido entre Q8_0 y IQ2_M.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del modelo (34,7B parámetros totales) y la ausencia de datos de VRAM por cuantización impiden afirmarlo.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server` con `--jinja`), según la model card. Otros motores (vLLM, TGI, Ollama) no se mencionan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Uncensored-xCloud (esta ficha) | 34,7B totales / ~3B activos | no disponible | Apache-2.0 | GGUF | Abliterated, solo texto, 0/10 rechazos |
| Qwen/Qwen3.6-35B-A3B (base) | 34,7B totales / ~3B activos | no disponible | Apache-2.0 | safetensors (y GGUF derivados) | Sin abliterar, ~10/10 rechazos, incluye visión |
| Otras variantes uncensored/abliterated de la misma familia | no disponible | no disponible | no disponible | no disponible | No hay datos en la información proporcionada |

No se dispone de información sobre alternativas comparables de otros autores en la búsqueda realizada.

## Limitaciones y advertencias

- La abliteration de dirección única no garantiza la eliminación de todos los comportamientos de seguridad; el autor advierte explícitamente que no debe considerarse una eliminación completa.
- El modelo hereda la cosmovisión, posiciones políticas y afirmaciones fácticas del modelo base Qwen3.6, de origen chino; la abliteration no modifica esos juicios.
- Riesgo elevado de generar contenido dañino: la reducción de rechazos a 0/10 implica que el modelo puede producir respuestas peligrosas si se le solicita; el uso está restringido a fines legales (investigación de seguridad, red teaming autorizado, moderación, academia).
- Idiomas limitados a chino e inglés según la metadata; el rendimiento en castellano no está verificado.
- Longitud de contexto no disponible, lo que impide planificar despliegues con ventanas largas.
- Sin capacidades de visión en esta release, pese a que el modelo base las incluye.
- Licencia Apache-2.0 permite uso comercial, pero el autor declara que el usuario asume toda la responsabilidad legal y ética; el publicador no respalda ningún uso indebido.
- No hay datos de benchmarks estándar ni de latencia/throughput, por lo que la calidad general más allá de la prueba de rechazo no está cuantificada.
- El repositorio tiene 1 like y 12.739 descargas, con actualización reciente (26 de octubre de 2026); la validación comunitaria es escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xCloudinfo/Qwen3.6-35B-A3B-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Perfil del autor: https://hf.co/xCloudinfo
- Método de abliteration citado: Arditi et al. (2024), "Refusal in Language Models Is Mediated by a Single Direction" (referencia bibliográfica; sin URL en la información proporcionada)
