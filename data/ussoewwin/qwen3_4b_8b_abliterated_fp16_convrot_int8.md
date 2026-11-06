# ussoewwin/qwen3_4b_8b_abliterated_fp16_convrot_int8

## Resumen

Este repositorio, publicado por el usuario ussoewwin, no contiene un modelo entrenado desde cero, sino una coleccion de releases consolidados en un unico archivo `.safetensors` a partir de tres checkpoints Qwen3 previamente sometidos a abliteration (eliminacion de vectores de rechazo) por huihui-ai. Concretamente, agrupa las variantes Qwen3-4B-abliterated, Qwen3-8B-abliterated y Huihui-Qwen3-VL-4B-Thinking-abliterated, cada una en dos formatos: FP16 consolidado y una cuantizacion INT8 propietaria denominada HSWQ ConvRot (Hybrid-Sensitivity-Weighted-Quantization).

El valor diferencial no esta en la arquitectura —heredada integramente de Qwen3, un transformer decoder-only denso— sino en el empaquetado: ficheros unicos sin shards, conversion determinista a IEEE FP16 y una cuantizacion selectiva por capas que preserva en mayor precision las proyecciones de atencion y vision mientras comprime las capas lineales mas tolerantes. Esto facilita el despliegue en pipelines de transformers, ComfyUI y entornos con restricciones de memoria, aunque el repo completo ocupa 99,5 GB.

Es relevante ahora porque combina tres tendencias: la demanda de modelos sin censura para investigacion, la popularizacion de variantes "thinking" con razonamiento explicito y la necesidad de formatos de un solo fichero para herramientas de inferencia local. La licencia Apache 2.0 y la ausencia de datos de benchmark publicados obligan a evaluar su comportamiento de forma empirica antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen3); variante VL con torre de vision |
| Parametros totales | 4B (Qwen3-4B), 8B (Qwen3-8B), 4B (Qwen3-VL-4B-Thinking) |
| Parametros activos | No aplica (modelos densos, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | FP16 (IEEE `torch.float16`) y HSWQ ConvRot INT8 (cuantizacion por capas con preservacion selectiva en FP16/BF16) |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | `.safetensors` de fichero unico (FP16 e INT8); compatible con `transformers` y ComfyUI |

## Arquitectura y entrenamiento

Los pesos derivan de la familia Qwen3 de Alibaba, con arquitectura transformer decoder-only densa. La variante VL-4B-Thinking incorpora una torre de vision para entrada multimodal y un modo de razonamiento explicito ("thinking") heredado de su checkpoint base. El autor del repositorio no ha entrenado ni fine-tuneado los modelos: su aportacion consiste en consolidar multiples shards en un unico `.safetensors`, convertir todos los parametros flotantes a FP16 estandar y aplicar la cuantizacion HSWQ ConvRot INT8.

HSWQ (Hybrid-Sensitivity-Weighted-Quantization) realiza un perfilado de sensibilidad e impacto de trayectoria capa por capa para identificar capas con outliers o alta importancia. Las proyecciones criticas de atencion y de vision se mantienen en FP16/BF16, mientras que las capas lineales mas robustas se empaquetan en INT8 con rotacion convolucional (ConvRot). El objetivo declarado es reducir memoria y acelerar inferencia sin degradar el razonamiento ni provocar bifurcaciones catastroficas de trayectoria. No se especifican en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; esos detalles corresponden a los checkpoints originales de Qwen3 y a la abliteration de huihui-ai.

## Capacidades

- Generacion de texto y conversacion multi-turno en los tres checkpoints.
- Razonamiento explicito en la variante VL-4B-Thinking (modo thinking).
- Procesamiento de imagen y texto en la variante vision-language (Qwen3-VL-4B).
- Generacion de codigo y matematicas, heredada de las capacidades de Qwen3.
- Formato de chat mediante `apply_chat_template` con roles `user`/`assistant`.
- Respuestas sin rechazo por abliteration: el modelo no aplica los vectores de negativa del checkpoint alineado original.
- Compatibilidad con `trust_remote_code=True` en `transformers`.
- Integracion con ComfyUI mediante el nodo HSWQ Loader para ejecucion tensorwise en INT8.
- Tool calling y function calling: no confirmado en la informacion proporcionada.
- Capacidades de agente multi-paso: no confirmadas en la informacion proporcionada.
- Soporte de audio: no disponible.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como la eliminacion de vectores de rechazo afecta a la distribucion de respuestas en tareas sensibles, comparando directamente contra los checkpoints Qwen3 originales.
- Evaluacion de tecnicas de cuantizacion: la pareja FP16/INT8 del mismo checkpoint facilita medir la degradacion introducida por HSWQ ConvRot en tareas de razonamiento y generacion, con un baseline exacto.
- Prototipado de asistentes conversacionales sin filtros: util en entornos de laboratorio donde se necesita explorar respuestas sin condicionamiento de seguridad, con la advertencia de que requiere revision humana.
- Procesamiento de documentos con imagenes: la variante VL-4B-Thinking puede extraer y razonar sobre contenido visual (capturas, diagramas, formularios) en flujos de investigacion.
- Integracion en ComfyUI para generacion de texto asistida: el loader HSWQ permite usar el modelo INT8 como text encoder o generador dentro de grafos de ComfyUI, con menor huella de VRAM.
- Despliegue en hardware limitado: la version INT8 del 4B (4,37 GB) y del VL-4B (6,25 GB) caben en GPUs de consumo con 8-12 GB de VRAM para inferencia en FP16/INT8.
- Fine-tuning posterior sobre dominio propio: al estar en FP16 y safetensors estandar, los checkpoints 4B y 8B sirven como punto de partida para LoRA o QLoRA en tareas especializadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para FP16: aproximadamente 8 GB para el 4B, 16 GB para el 8B y 9 GB para el VL-4B (los tamanos de fichero son 8,04 GB, 16,38 GB y 8,88 GB respectivamente, mas overhead de activaciones y KV cache).
- VRAM estimada para INT8: aproximadamente 4,4 GB para el 4B y 6,3 GB para el VL-4B (tamanos de fichero 4,37 GB y 6,25 GB).
- GPUs recomendadas: A100 40/80 GB o H100 para el 8B en FP16 con contexto largo; RTX 4090 (24 GB) para el 8B FP16 y todos los INT8; RTX 3090, 4080 o 4070 Ti para el 4B FP16 e INT8.
- Cabe en GPU de consumo: si. El 4B INT8 en GPUs de 8 GB; el VL-4B INT8 en 8-12 GB; el 8B FP16 en 24 GB.
- Opciones de despliegue: `transformers` con `device_map="auto"`; ComfyUI mediante HSWQ Loader para INT8; vLLM, llama.cpp, Ollama y TGI no estan confirmados para el formato HSWQ ConvRot INT8 (requieren conversion previa a GGUF o soporte del kernel).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ussoewwin/qwen3_4b_8b_abliterated_fp16_convrot_int8 (esta ficha) | 4B / 8B / 4B-VL | No disponible | Apache 2.0 | safetensors FP16 e INT8 | Coleccion consolidada, sin benchmarks publicados |
| huihui-ai/Qwen3-8B-abliterated | 8B | No disponible | Apache 2.0 | safetensors multi-shard | Checkpoint upstream, sin cuantizacion propietaria |
| huihui-ai/Huihui-Qwen3-VL-4B-Thinking-abliterated | 4B VL | No disponible | Apache 2.0 | safetensors | Upstream multimodal con thinking |
| Qwen/Qwen3-8B (original alineado) | 8B | No disponible | Apache 2.0 | safetensors, GGUF | Con vectores de rechazo intactos; benchmarks publicados por Alibaba |

## Limitaciones y advertencias

- Abliteration: los tres checkpoints han eliminado los vectores de rechazo, por lo que pueden producir contenido inapropiado, danino o ilegal. El autor restringe su uso a investigacion, pruebas y evaluacion autorizada.
- Sin benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K ni de calidad de cuantizacion, lo que impide comparar objetivamente con los originales.
- Integridad de ficheros: el autor documenta que una copia anterior del 8B FP16 contenia 206 tensores a cero y fue retirada. Un fichero cacheado cuyo sha256 empiece por `aaa6490eddd0` corresponde a esa copia danada y debe sustituirse por el auditado (`e1c1b814...`). Los releases 4B y VL-4B no tienen entrada de auditoria en la informacion disponible.
- Cuantizacion propietaria: HSWQ ConvRot INT8 no es un formato estandar; requiere el loader especifico y no es compatible directamente con vLLM, llama.cpp u Ollama.
- Riesgo de alucinacion: inherente a los modelos de 4B y 8B, agravado por la ausencia de evaluacion publicada.
- Idiomas y contexto: no se especifican en la informacion disponible; conviene verificar empiricamente antes de desplegar en produccion multilingue o con contextos largos.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal sobre el contenido generado recae en el usuario.
- Repositorio de 99,5 GB: descargar solo los ficheros necesarios para evitar consumo excesivo de disco y ancho de banda.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ussoewwin/qwen3_4b_8b_abliterated_fp16_convrot_int8
- Framework HSWQ: https://github.com/ussoewwin/Hybrid-Sensitivity-Weighted-Quantization
- Loader ComfyUI: https://github.com/ussoewwin/ComfyUI-HSWQ-Loader-and-Tools
- Modelo base 4B: https://huggingface.co/huihui-ai/Qwen3-4B-abliterated
- Modelo base 8B: https://huggingface.co/huihui-ai/Qwen3-8B-abliterated
- Modelo base VL-4B-Thinking: https://huggingface.co/huihui-ai/Huihui-Qwen3-VL-4B-Thinking-abliterated
