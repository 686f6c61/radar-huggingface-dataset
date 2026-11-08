# theblackcat102/adl-qwen3.5-4b-gemma-lora

## Resumen

`theblackcat102/adl-qwen3.5-4b-gemma-lora` es un adaptador LoRA (PEFT) publicado por el usuario theblackcat102 sobre el modelo base Qwen/Qwen3.5-4B. Se trata de un ajuste fino ligero entrenado con Axolotl, según indican las etiquetas del repositorio, y orientado a generación de texto y uso conversacional. El nombre sugiere una destilación o mezcla de estilo desde Gemma hacia Qwen3.5-4B, aunque el autor no documenta este extremo en la model card.

El modelo base Qwen3.5-4B pertenece a la familia Qwen3.5 de Alibaba, presentada en febrero de 2026 con un enfoque explícito en capacidades agénticas. Con 4.000 millones de parámetros, se sitúa en el segmento de modelos pequeños aptos para inferencia local. El adaptador ocupa 0,5 GB, lo que corresponde a los pesos LoRA en safetensors, no al modelo completo.

La relevancia de esta ficha es limitada por la escasez de documentación: la model card es la plantilla por defecto de Hugging Face, sin datos de entrenamiento, hiperparámetros, evaluación ni licencia. Cualquier uso en producción debería partir de la verificación empírica del adaptador sobre el modelo base y de la licencia heredada de Qwen3.5-4B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer Qwen3.5-4B; arquitectura del adaptador no disponible |
| Parametros totales | 4B en el modelo base; tamano del adaptador no disponible (repo de 0,5 GB) |
| Parametros activos | no disponible (no consta que el modelo base sea MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-4B, no documentada en esta ficha) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion aplica al modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con Axolotl y empaquetado con PEFT 0.19.1, que se aplica sobre el modelo base Qwen3.5-4B. No se especifica el rango (`r`), el alpha, los módulos objetivo ni el número de pasos de entrenamiento. Tampoco se detalla la composición del dataset, el número de tokens vistos ni si hubo fases de SFT, DPO o RLHF.

El nombre del repositorio incluye "gemma", lo que sugiere que el ajuste podría orientarse a transferir estilo, formato de respuesta o comportamiento desde un modelo Gemma, pero el autor no lo confirma en ningún momento. No hay información sobre precisión de entrenamiento (bf16, fp16, fp8) ni sobre la infraestructura utilizada.

## Capacidades

- Generación de texto conversacional, heredada del pipeline `text-generation` declarado en el repositorio.
- Ajuste de estilo o comportamiento sobre el modelo base, presumiblemente orientado a respuestas con formato tipo Gemma (no confirmado por el autor).
- Capacidades del modelo base Qwen3.5-4B: no documentadas en esta ficha; deben consultarse en la model card de Qwen/Qwen3.5-4B.
- Soporte de tool calling, agentes, razonamiento multi-paso, matemáticas o código: no disponible para el adaptador; depende del modelo base.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Evaluación de adaptadores LoRA de bajo coste: cargar el adaptador sobre Qwen3.5-4B con PEFT y comparar respuestas antes y después del ajuste para medir el efecto real del entrenamiento.
- Experimentación académica con Axolotl: usar el repositorio como referencia de configuración de un pipeline LoRA sobre un modelo de 4B en una sola GPU.
- Prototipado de asistentes conversacionales ligeros: desplegar el modelo base con el adaptador en entornos con VRAM limitada, siempre que se valide primero la calidad del ajuste.
- Investigación sobre transferencia de estilo entre familias de modelos: si el nombre "gemma" refleja el objetivo real, el adaptador puede servir para estudiar cómo se trasladan rasgos de un modelo a otro mediante LoRA.
- Base para un segundo ajuste fino: partir de este adaptador como inicialización en lugar de entrenar desde cero, reduciendo el coste de un SFT específico de dominio.
- Pruebas de regresión de infraestructura: verificar que el stack PEFT + transformers + Axolotl carga correctamente adaptadores sobre Qwen3.5-4B en un entorno de CI.
- Docencia y demostraciones: ilustrar el flujo completo de publicación de un adaptador LoRA en Hugging Face, incluida la estructura de repositorio y las etiquetas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para el modelo base en bf16: aproximadamente 8 GB para los 4B parámetros, más overhead de activaciones y KV cache.
- VRAM para el modelo base en cuantización de 4 bits: aproximadamente 2,5-3 GB, más overhead.
- El adaptador LoRA añade 0,5 GB en disco y una cantidad de VRAM no determinada (depende de r y de los módulos objetivo, no documentados).
- GPU consumer: un modelo de 4B en 4 bits cabe en GPUs con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 2070); en bf16 requiere 12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4080).
- GPU de datacenter: A100, H100 y L40S son sobredimensionadas para un 4B; útiles solo para servir en lote con alto throughput.
- Despliegue: transformers + PEFT para cargar el adaptador; vLLM y TGI admiten adaptadores LoRA con configuración adicional; llama.cpp y Ollama requieren fusionar el adaptador en el modelo base y exportar a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| adl-qwen3.5-4b-gemma-lora (este) | 4B (base) + adaptador | no disponible | no disponible | safetensors (LoRA) | Adaptador sin documentar, 0 descargas |
| Qwen/Qwen3.5-4B | 4B | no disponible en esta ficha | no disponible en esta ficha | safetensors | Modelo base oficial de Alibaba; capacidades agénticas anunciadas |
| MiniCPM5-2B | 2B | no disponible en esta ficha | no disponible en esta ficha | no disponible | Alternativa local de menor tamaño, citada en comparativas de 2026 |
| Gemma 3 4B | 4B | no disponible en esta ficha | no disponible en esta ficha | no disponible | Alternativa de Google del mismo orden de magnitud |

La comparación de rendimiento entre estos modelos no puede establecerse con los datos disponibles; las referencias web consultadas mencionan una comparativa agregada, pero no se aportan cifras verificables en la información proporcionada.

## Limitaciones y advertencias

- La model card es la plantilla por defecto: no hay información sobre datos de entrenamiento, hiperparámetros, evaluación ni uso previsto.
- Licencia no declarada en el repositorio; la licencia efectiva del adaptador y del modelo base debe verificarse antes de cualquier uso comercial.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.
- El origen del ajuste ("gemma" en el nombre) no está confirmado; asumir que replica el comportamiento de Gemma sería una inferencia no respaldada.
- Riesgo de alucinación y sesgos: no evaluados para este adaptador; heredados en parte del modelo base y del dataset de ajuste, que se desconoce.
- Idiomas soportados no declarados: no se puede garantizar un rendimiento aceptable en castellano ni en otros idiomas.
- El adaptador no es un modelo autónomo: requiere descargar Qwen3.5-4B por separado y cargarlo con PEFT; el repositorio de 0,5 GB no contiene los pesos completos.
- Para producción, se recomienda fusionar el adaptador, evaluar con un conjunto propio y comparar contra el modelo base sin ajuste antes de adoptarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/theblackcat102/adl-qwen3.5-4b-gemma-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Noticia sobre el lanzamiento de Qwen3.5 (CNBC): https://www.cnbc.com/2026/02/17/china-alibaba-qwen-ai-agent-latest-model.html
- Comparativa MiniCPM5-2B vs Qwen3.5-4B vs Gemma 3 4B: https://tech-insider.org/ca/minicpm5-2b-vs-qwen3-5-4b-vs-gemma-3-4b-2026/
- Paper citado en las etiquetas (Lacoste et al., 2019, impacto ambiental): https://arxiv.org/abs/1910.09700
