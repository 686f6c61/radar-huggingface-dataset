# youngseok12/AX-4.0-Light-sft_71949_text_causal

## Resumen

El modelo `youngseok12/AX-4.0-Light-sft_71949_text_causal` es un ajuste fino (SFT) del modelo base `skt/A.X-4.0-Light`, desarrollado por SK Telecom y publicado por el usuario youngseok12 en Hugging Face. Se trata de un modelo de lenguaje causal de la familia Qwen2, con 7.259.624.960 parámetros (aproximadamente 7,26 mil millones), entrenado específicamente para razonamiento causal en coreano a partir de un subconjunto filtrado del dataset AI Hub 71949. El ajuste se realizó mediante LoRA (rank 16) y posterior fusión de los adaptadores en los pesos completos, dando como resultado un modelo independiente en formato BF16 safetensors.

La relevancia de este modelo radica en su enfoque en el razonamiento causal en coreano, un área poco cubierta por los modelos multilingües generalistas. Al estar basado en A.X-4.0-Light, hereda la optimización para el idioma coreano y la arquitectura Qwen2, pero con un entrenamiento adicional orientado a tareas de causalidad. Su licencia Apache 2.0 permite uso comercial, aunque los datos de entrenamiento de AI Hub tienen sus propios términos. Es un modelo experimental pensado para investigación y evaluación controlada, no para producción directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2-family causal language model (base: skt/A.X-4.0-Light) |
| Parametros totales | 7.259.624.960 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (entrenamiento con secuencias de 2048 tokens) |
| Tipos de cuantizacion | No disponible (solo pesos BF16 safetensors publicados) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura original de `skt/A.X-4.0-Light`, que a su vez se basa en Qwen2.5. No se modificó la arquitectura base; el ajuste se realizó mediante LoRA con rank 16, alpha 32 y dropout 0.05, aplicado a las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. Tras el entrenamiento, los adaptadores se fusionaron en los pesos completos, produciendo un modelo standalone que no requiere código personalizado ni `trust_remote_code`.

El entrenamiento se llevó a cabo sobre un subconjunto del dataset AI Hub 71949 (Causal Reasoning), del que se extrajeron 528 registros únicos tras filtrar aquellos que requerían imágenes (el dataset original incluye anotaciones con soporte visual, pero las imágenes no se descargaron). Se utilizaron 478 ejemplos de entrenamiento y 50 de desarrollo, con 2 épocas, learning rate 5e-5, scheduler lineal sin warmup, weight decay 0, secuencias de 2048 tokens, batch efectivo de 8 y precisión BF16. El objetivo de entrenamiento fue la pérdida de entropía cruzada sobre los tokens de respuesta, enmascarando los tokens de sistema y usuario. No se empleó RLHF ni DPO; es un SFT puro.

## Capacidades

- Generación de texto en coreano con formato conversacional (chat template oficial de A.X preservado).
- Razonamiento causal: el modelo está específicamente entrenado para responder preguntas que requieren inferir causas, efectos o relaciones causales.
- Respuestas estructuradas: tiende a presentar la respuesta principal al inicio y añadir una breve justificación cuando es necesario.
- Compatible con pipelines estándar de Transformers y vLLM sin necesidad de código adicional.
- No se menciona soporte para tool calling, function calling, agentes, visión, audio ni modos de pensamiento explícitos.
- Capacidades multilingües limitadas: aunque la arquitectura base podría soportar otros idiomas, el entrenamiento se centró exclusivamente en coreano y la model card solo declara `ko`.

## Casos de uso

- Investigación académica en razonamiento causal: el modelo puede utilizarse para experimentos controlados en comprensión de relaciones causales en coreano, comparando su rendimiento con otros modelos base o ajustados.
- Evaluación de benchmarks coreanos: sirve como punto de referencia para medir el impacto del SFT en tareas como KMMLU-Pro, CLIcK o SNU Ko-MuSR, tal como se reporta en la model card.
- Prototipado de asistentes conversacionales en coreano: gracias a su formato de chat y su enfoque en respuestas concisas, puede integrarse en demos o pruebas de concepto de chatbots para dominios específicos.
- Análisis de textos causales: útil para tareas de extracción de causas y efectos en documentos coreanos, aunque con las limitaciones de un modelo de 7B entrenado con pocos datos.
- Experimentos de fine-tuning: al ser un modelo abierto con pesos completos, puede servir como punto de partida para nuevos ajustes con LoRA o full fine-tuning en dominios relacionados.
- Validación de pipelines de despliegue: su compatibilidad con vLLM y Transformers lo hace adecuado para probar infraestructuras de inferencia en entornos de investigación.

## Benchmarks y rendimiento

La model card reporta resultados de evaluación local (no oficiales del K-AI Leaderboard) con sondas deterministas `free` y `B1_constrained`. Los valores de precisión parseada son los siguientes:

| Benchmark | Precisión parseada |
|---|---:|
| KMMLU-Pro | 47,27 % |
| CLIcK | 67,37 % |
| HLE text-only | 3,75 % |
| SNU Ko-MuSR | 48,93 % |
| Com2-main | 50,60 % |
| Original MuSR (suplementario) | 55,56 % |

La media local de los cinco ejes principales (KMMLU-Pro, CLIcK, HLE text-only, SNU Ko-MuSR y Com2-main) es del 43,59 %. El informe indica que la ejecución completa no produjo errores de generación. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo en BF16 ocupa aproximadamente 14,5 GB (según el tamaño del repositorio). Para inferencia con contexto moderado se recomienda al menos 16 GB de VRAM.
- GPUs compatibles: RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB), o GPUs profesionales con 16 GB o más. En GPUs de 8 GB (como RTX 3070) no cabría sin cuantización.
- No se publican versiones cuantizadas (GGUF, AWQ, GPTQ), por lo que el despliegue en hardware de consumo requiere conversión manual.
- Opciones de despliegue: Transformers (con `device_map="auto"`), vLLM (mencionado en la model card), y potencialmente TGI (el tag `text-generation-inference` y `endpoints_compatible` sugieren compatibilidad).
- Latencia y throughput: no se proporcionan datos. Para un modelo de 7B en BF16, se puede esperar un throughput del orden de 20-50 tokens/s en una A100, pero depende de la configuración.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| youngseok12/AX-4.0-Light-sft_71949_text_causal | 7,26 B | No disponible | Razonamiento causal en coreano | Apache 2.0 |
| skt/A.X-4.0-Light (base) | 7,26 B (estimado) | No disponible | Coreano general, optimizado para empresa | Apache 2.0 |
| youngseok12/AX-3.1-Light-sft_v3_2_aihub_extension | No disponible | No disponible | SFT en coreano con datos AI Hub | Apache 2.0 |
| Qwen2.5-7B (base) | 7,61 B | 32k (típico) | Multilingüe general | Apache 2.0 |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se basa en características declaradas.

## Limitaciones y advertencias

- Conjunto de entrenamiento extremadamente reducido: solo 478 ejemplos, lo que limita la generalización y puede provocar sobreajuste a los patrones específicos del dataset.
- Sesgo hacia el razonamiento causal: el modelo puede fallar en tareas que no sigan el formato de los datos de entrenamiento.
- Riesgo de alucinación: como todo LLM, puede generar información falsa o razonamientos incorrectos, especialmente en dominios especializados.
- Solo coreano: no se garantiza un rendimiento aceptable en otros idiomas, aunque la arquitectura base sea multilingüe.
- Limitaciones de contexto: la longitud de contexto no está documentada; el entrenamiento usó 2048 tokens, por lo que secuencias más largas pueden degradar el rendimiento.
- Datos de AI Hub: aunque la licencia del modelo es Apache 2.0, los términos de uso del dataset AI Hub 71949 siguen aplicando a los datos de entrenamiento.
- Modelo experimental: no es apto para uso en producción sin una validación exhaustiva, y no debe utilizarse como sistema de asesoramiento médico, legal, financiero o profesional.
- Sin soporte de herramientas ni agentes: no se ha entrenado para tool calling, por lo que no es adecuado para integraciones que requieran funciones externas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/youngseok12/AX-4.0-Light-sft_71949_text_causal
- Modelo base: https://huggingface.co/skt/A.X-4.0-Light
- GitHub de A.X-4.0 (SK Telecom): https://github.com/SKT-AI/A.X-4.0/blob/main/README.en.md
- Dataset AI Hub 71949 (Causal Reasoning): https://www.aihub.or.kr/aihubdata/data/view.do?currMenu=115&topMenu=100&aihubDataSe=realm&dataSetSn=71949
- Modelos relacionados del mismo autor: https://huggingface.co/youngseok12/AX-3.1-Light-sft_A1_paperguided4k y https://huggingface.co/youngseok12/AX-3.1-Light-sft_v3_2_aihub_extension
