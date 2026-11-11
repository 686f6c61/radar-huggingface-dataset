# UraionLabs/Uraion-Cyber-V1.0-GGUF

## Resumen

Uraion Cyber V1.0 es un modelo de lenguaje especializado en seguridad defensiva y trabajo agéntico, desarrollado por Uraion Labs. Se distribuye aquí en formato GGUF, cuantizado para su uso con llama.cpp, Ollama y LM Studio. El modelo está construido sobre la familia Qwen 3.5/3.6 35B-A3B, una arquitectura de mezcla de expertos (MoE) con aproximadamente 35.000 millones de parámetros totales y unos 3.000 millones activos por token, repartidos en 256 expertos con 8 enrutados por token. Su ventana de contexto alcanza los 262.144 tokens.

El modelo está orientado a tareas de auditoría de código, detección de vulnerabilidades, generación de parches y razonamiento multi-paso con soporte de tool calling. Su propuesta diferencial es que no solo identifica fallos de seguridad, sino que los demuestra en un entorno controlado, propone el parche correspondiente y reconoce código correcto cuando no hay defecto que reportar.

Esta ficha cubre la variante GGUF, que abarca cuantizaciones desde 2 bits (IQ2_XXS) hasta 8 bits (Q8_0) y BF16 completo, calibradas con una importance matrix calculada sobre un conjunto de calibración del dominio. La relevancia actual reside en la posibilidad de desplegar un modelo de seguridad de 35B en hardware de consumo o estaciones de trabajo con GPU única, gracias a su bajo número de parámetros activos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), familia Qwen 3.5/3.6 35B-A3B |
| Parametros totales | 34.660.610.688 (~34,66 B) |
| Parametros activos | ~3 B por token (256 expertos, 8 enrutados por token) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, IQ3_XXS, IQ3_XS, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q6_K_S, Q6_K_L, Q8_0, BF16 |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); modelo base en BF16 |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer con mezcla de expertos dispersa: 256 expertos en total, de los cuales 8 se enrutan por token, lo que resulta en aproximadamente 3.000 millones de parámetros activos sobre un total de 34.660 millones. Esta configuración permite una generación de tokens rápida incluso cuando parte del modelo se descarga a memoria del sistema, ya que el coste computacional por token depende de los expertos activados y no del total de pesos.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. El modelo base es UraionLabs/Uraion-Cyber-V1.0, del que esta variante es una cuantización. Las cuantizaciones se han calibrado con una importance matrix (imatrix-Uraion-Cyber-V1.0.gguf) calculada sobre el conjunto de calibración del dominio del modelo. Cada archivo GGUF incorpora el tokenizer y la plantilla de chat de Qwen 35B-A3B sin modificaciones, y el repositorio incluye sumas de verificación SHA256 y registros de validación por archivo en quantization_info.json.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Auditoría de código y detección de vulnerabilidades de seguridad (appsec, infosec, seguridad defensiva).
- Demostración de fallos explotables en entorno controlado (sandbox) y generación de parches.
- Reconocimiento de código correcto, evitando falsos positivos cuando no hay defecto.
- Razonamiento con modo "thinking" explícito, desactivable mediante chat_template_kwargs con enable_thinking en false.
- Soporte de tool calling y function calling.
- Capacidades agénticas y razonamiento multi-paso.
- Integración con llama.cpp, Ollama y LM Studio mediante API compatible con OpenAI (llama-server).
- Capacidades multilingües limitadas al inglés.

## Casos de uso

- Auditoría de seguridad de servicios en producción: el modelo recibe el código fuente de un servicio y devuelve si existe una vulnerabilidad explotable, nombrando la función afectada y la petición que la demuestra, o confirmando que el código es sólido. Su contexto de 262.144 tokens permite analizar módulos completos sin truncar.
- Generación de parches automáticos: tras identificar un fallo, el modelo propone el parche correspondiente, lo que permite integrarlo en un pipeline de revisión de código o en un flujo de CI/CD con validación humana posterior.
- Asistente de revisión de pull requests: con tool calling puede consultar el diff, ejecutar análisis estáticos y devolver un informe estructurado de hallazgos de seguridad por cada cambio.
- Agente de triaje de vulnerabilidades: en un flujo multi-paso, el modelo puede clasificar alertas de escáneres, descartar falsos positivos y priorizar los hallazgos realmente explotables.
- Despliegue local en estaciones de trabajo de seguridad: al ser GGUF con cuantizaciones desde IQ2_M (12-16 GB de memoria), puede ejecutarse en portátiles con GPU de consumo o Apple Silicon, manteniendo los datos del código auditado fuera de servicios en la nube.
- Formación y concienciación en seguridad: el modelo puede explicar por qué un fragmento de código es vulnerable y cómo corregirlo, sirviendo como apoyo en revisiones guiadas.
- Automatización de análisis de código legado: con contexto largo, puede procesar repositorios extensos por módulos y generar informes de deuda de seguridad.

## Benchmarks y rendimiento

La model card indica que los resultados del modelo padre (BF16 servido con vLLM 0.33.0, cuantización FP8 de pesos en carga) están publicados en la model card del modelo base, pero no se incluyen cifras concretas en la información disponible, y se advierte explícitamente que no fueron medidas sobre los archivos GGUF. Por tanto:

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada según cuantización (según la guía del autor, elegir un archivo 2-4 GB menor que la memoria disponible para dejar espacio a la caché KV):
  - 12-16 GB: IQ2_M (recomendado), IQ2_XXS, IQ2_XS, IQ2_S, Q2_K.
  - 16-20 GB: IQ3_M (recomendado), IQ3_XXS, IQ3_XS, Q3_K_S, Q3_K_M, Q3_K_L.
  - 24 GB: Q4_K_M (recomendado, 21,17 GB, 4,88 BPW), IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_1.
  - 32 GB: Q5_K_M o Q6_K (recomendados), Q5_K_S, Q6_K_S, Q6_K_L.
  - 48 GB o más: Q8_0 (recomendado), Q6_K_L.
  - 80 GB o más: BF16 (recomendado), Q8_0.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; la tabla de memoria permite inferir que Q4_K_M encaja en GPUs de 24 GB (por ejemplo, RTX 4090) y BF16 requiere GPUs de 80 GB (por ejemplo, A100/H100).
- Cabe en GPU de consumo: sí, desde cuantizaciones de 2 bits en GPUs de 12-16 GB, y Q4_K_M en GPUs de 24 GB.
- Apple Silicon: soportado mediante Metal, con memoria unificada.
- Opciones de despliegue: llama.cpp (llama-server con API compatible con OpenAI), Ollama, LM Studio. El modelo padre se sirvió con vLLM 0.33.0 para las mediciones de referencia.
- Latencia y throughput: no disponibles. El autor señala que la generación de tokens es rápida incluso con descarga parcial a memoria del sistema, gracias a los ~3 B de parámetros activos por token.
- Parámetros de muestreo recomendados: temperatura 1.0, top_p 0.95, top_k 20.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Uraion Cyber V1.0 GGUF | ~34,66 B totales, ~3 B activos | 262.144 | MIT | GGUF | Especializado en seguridad defensiva y agentes |
| Qwen 35B-A3B (familia base) | ~35 B totales, ~3 B activos | 262.144 (según model card) | No disponible en la información | No disponible | Modelo generalista del que deriva la familia |
| Alternativas de seguridad especializadas | No disponible | No disponible | No disponible | No disponible | No se dispone de datos de comparación en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento con modelos de la misma categoría.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación: como todo modelo generativo, puede inventar vulnerabilidades o parches incorrectos; los hallazgos deben validarse en sandbox y con revisión humana.
- Calidad por cuantización: las cuantizaciones de 2 y 3 bits sacrifican calidad a cambio de menor huella de memoria; los resultados de referencia del modelo padre no aplican a los archivos GGUF.
- Sesgos: no se documentan sesgos específicos en la información disponible.
- Restricciones de licencia: licencia MIT, que permite uso comercial con atribución; consultar el archivo LICENSE del repositorio para los términos exactos.
- Uso en producción: requiere un build reciente de llama.cpp con soporte qwen35moe; la plantilla de chat y el tokenizer deben usarse sin modificar.
- Seguridad: el modelo está orientado a seguridad defensiva; su uso para generar exploits contra sistemas sin autorización queda fuera del propósito declarado.
- Datos de benchmarks: no hay mediciones publicadas sobre las cuantizaciones GGUF.

## Enlaces

- Repositorio GGUF: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0-GGUF
- Modelo base BF16: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0
- Familia Qwen 35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Web de Uraion Labs: https://uraionlabs.com/
- Licencia: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0-GGUF/blob/main/LICENSE
- Importance matrix: imatrix-Uraion-Cyber-V1.0.gguf (en el repositorio)
- Sumas de verificación: SHA256SUMS (en el repositorio)
- Registros de cuantización: quantization_info.json (en el repositorio)
