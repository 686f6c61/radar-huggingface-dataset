# taobao-mnn/LFM2-24B-A2B-MNN

## Resumen

LFM2-24B-A2B-MNN es un paquete de inferencia cuantizado en 4 bits con HQQ para el framework MNN (Mobile Neural Network) de Alibaba, generado a partir del modelo original LiquidAI/LFM2-24B-A2B de Liquid AI. No se trata de un modelo nuevo ni de un fine-tuning, sino de una conversión de pesos orientada al despliegue en CPU y entornos de recursos limitados mediante el motor MNN. El repositorio lo publica la cuenta taobao-mnn y está pensado para ejecutarse con `llm_demo` y `llm_bench` del proyecto MNN.

El modelo subyacente, LFM2-24B-A2B, emplea una arquitectura híbrida MoE (mixture of experts) con 24 000 millones de parámetros totales y activación de un subconjunto reducido por token (4 de 64 expertos enrutados). Consta de 40 capas y está diseñado como modelo instructivo de propósito general, sin trazas de razonamiento explícitas, con foco en el seguimiento de instrucciones y el uso de herramientas.

La relevancia de este paquete radica en que permite ejecutar un MoE de 24B en hardware modesto gracias a la cuantización HQQ de 4 bits (group size 64, escalas FP16) y a la compartición del embedding de tokens con `lm_head`. El repositorio ocupa 28,4 GB y declara únicamente el idioma inglés. La licencia es LFM1.0 (etiquetada como "other"), heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE (40 capas, 64 expertos enrutados) |
| Parametros totales | 24B (modelo original) |
| Parametros activos | 4 expertos enrutados por token (A2B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | HQQ 4-bit, group size 64, escalas FP16; embedding 4-bit compartido con `lm_head` |
| Idiomas soportados | en |
| Licencia | LFM1.0 (etiqueta "other") |
| Formato de pesos | MNN (pesos convertidos con `llmexport.py`; no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo original LFM2-24B-A2B es un transformer híbrido con 40 capas y una capa MoE de 64 expertos enrutados, de los que se seleccionan 4 por token. Este paquete MNN no reentrena ni modifica la arquitectura: aplica cuantización HQQ de 4 bits sobre las capas lineales de texto (group size 64, escalas en FP16) y almacena el embedding de tokens en 4 bits, compartido con `lm_head`. El archivo `llm_config.json` registra los offsets de pesos compartidos y `tie_embeddings.quant_bit`; el argumento `--embed_bit 16` solo afecta a un embedding exportado por separado y no genera pesos BF16 en este checkpoint.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. La model card de este paquete se limita a documentar el proceso de conversión (revisión de MNN `7337404b2815b5fb9ddac13f4ac6a1fb37fcbbb4`), los argumentos de exportación y las comprobaciones funcionales de humo (6 casos CPU High/Low), que no constituyen una evaluación amplia de calidad ni un benchmark de GPU.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `chat`).
- Seguimiento de instrucciones de propósito general, según la model card del modelo original.
- Uso de herramientas (tool use / function calling), mencionado en la model card upstream.
- Inferencia en CPU mediante MNN, con modos de memoria alta y baja (`MNN_LOW_MEMORY`, `MNN_SUPPORT_TRANSFORMER_FUSE`).
- Soporte de plantilla de chat mediante `jinja` y `use_template` en la configuración.
- Idioma: únicamente inglés declarado.
- No se documentan capacidades de visión, audio, modo thinking ni razonamiento multi-paso explícito en la información disponible.

## Casos de uso

- Despliegue en portátiles y equipos de sobremesa sin GPU dedicada: el paquete MNN con cuantización HQQ 4-bit y modo de baja memoria permite ejecutar un MoE de 24B en CPU, adecuado para prototipos y demos locales.
- Asistentes conversacionales en inglés sobre infraestructura propia: el pipeline `text-generation` con plantilla de chat permite integrar el modelo en aplicaciones de chat multi-turno sin depender de servicios en la nube.
- Automatización con tool calling en entornos edge: la capacidad de uso de herramientas del modelo original, combinada con el motor MNN, facilita agentes ligeros en dispositivos con recursos limitados.
- Evaluación y benchmarking de motores de inferencia: `llm_bench` permite medir latencia y throughput en CPU para comparar configuraciones de cuantización y memoria.
- Pruebas de integración en pipelines MNN: útil para equipos que ya usan MNN y necesitan un modelo instructivo de mayor tamaño para validar flujos de exportación y ejecución.
- Investigación sobre cuantización: sirve como referencia reproducible para estudiar el impacto de HQQ 4-bit con group size 64 en un MoE de 24B, ya que la model card documenta los comandos exactos de exportación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona 6 casos de humo funcionales en CPU (High/Low) que verifican que el modelo se ejecuta, sin métricas de calidad, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica de forma directa; el paquete está orientado a CPU. El repositorio ocupa 28,4 GB, por lo que se requiere espacio en disco equivalente.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no documentada; el foco declarado es CPU (compilación Linux CPU con `MNN_BUILD_LLM`).
- Opciones de despliegue: MNN (`llm_demo`, `llm_bench`) con la revisión `7337404b2815b5fb9ddac13f4ac6a1fb37fcbbb4`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; `llm_bench` permite medirlos, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM2-24B-A2B-MNN (este) | 24B totales, 4 expertos activos | no disponible | LFM1.0 | MNN HQQ 4-bit | Paquete de inferencia CPU |
| LiquidAI/LFM2-24B-A2B | 24B totales, 4 expertos activos | no disponible | LFM1.0 | safetensors | Modelo original en BF16 |
| Alternativas de 24B densas o MoE | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Solo se declara soporte de inglés; el rendimiento en otros idiomas no está garantizado.
- La cuantización HQQ 4-bit puede degradar la calidad respecto al checkpoint original en BF16; no se han publicado evaluaciones comparativas.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan medidas específicas de mitigación.
- La licencia LFM1.0 ("other") puede imponer restricciones al uso comercial; es necesario revisar el archivo `LICENSE` y la licencia del modelo upstream antes de desplegar en producción.
- El paquete está acoplado a una revisión concreta de MNN; otras versiones pueden no ser compatibles con los offsets de pesos y la configuración.
- Las comprobaciones de humo (6 casos CPU) no validan calidad ni rendimiento en cargas reales.
- No se dispone de información sobre sesgos conocidos, longitud de contexto ni comportamiento en conversaciones largas.
- El embedding de tokens está cuantizado a 4 bits y compartido con `lm_head`; esto puede afectar a la fidelidad de la generación frente al modelo original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/taobao-mnn/LFM2-24B-A2B-MNN
- Modelo original: https://huggingface.co/LiquidAI/LFM2-24B-A2B
- Repositorio MNN: https://github.com/alibaba/MNN
- Revisión MNN usada: https://github.com/alibaba/MNN/commit/7337404b2815b5fb9ddac13f4ac6a1fb37fcbbb4
- Documentación MNN LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
