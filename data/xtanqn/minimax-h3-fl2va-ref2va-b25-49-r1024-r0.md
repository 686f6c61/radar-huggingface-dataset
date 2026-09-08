# xtanqn/MiniMax-H3-fl2va-ref2va-b25-49-r1024-r0

## Resumen

MiniMax-H3 hybrid (fl2va × ref2va) es un modelo derivado creado por el usuario xtanqn a partir de los checkpoints oficiales de MiniMax AI. Se trata de una fusión de dos variantes del modelo MiniMax-H3: fl2va, orientada al control de primer y último fotograma y a la calidad de imagen y audio, y ref2va, especializada en la generación guiada por imágenes, vídeos o audio de referencia. El resultado es un checkpoint autocontenido que unifica ambas rutas en un solo archivo, evitando la necesidad de cargar dos modelos separados.

La fusión se ha realizado a nivel de tensores mediante técnicas de sustitución de bloques y Delta-Fused, sin entrenamiento ni LoRA. Se ofrecen tres variantes (b25-49, r1024 y r0) que difieren en la intensidad de la inyección de las capacidades de referencia. El modelo está cuantizado en formato fp8_scaled, pensado para su uso en ComfyUI, y ha sido probado en una NVIDIA V100. Su relevancia radica en permitir a los desarrolladores elegir el equilibrio entre calidad de generación nativa y fidelidad a las referencias externas dentro de un mismo artefacto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) híbrido de audio y video, basado en MiniMax-H3 |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp8_scaled (F8_E4M3 + per-tensor weight_scale, scale = max(|W|)/448) |
| Idiomas soportados | no disponible (modelo de generacion de video y audio) |
| Licencia | MiniMax H3 Community License Agreement (no MIT) |
| Formato de pesos | fp8_scaled (ComfyUI comfy_quant), checkpoint autocontenido |

## Arquitectura y entrenamiento

El modelo es un derivado de MiniMax-H3, un Diffusion Transformer híbrido que genera audio y vídeo de forma conjunta. No ha sido entrenado desde cero; en su lugar, se ha construido mediante fusión de pesos entre los dos checkpoints oficiales: fl2va y ref2va. La fusión se realiza a nivel de tensores y se presenta en tres variantes:

- b25-49: parte de fl2va y sustituye únicamente los parámetros de AdaLN (adaln_proj.linear.*) de los bloques 25 a 49 por los de ref2va. El trunk (capas de atención y MLP) permanece idéntico a fl2va, por lo que es la variante más conservadora.
- r1024: aplica una inyección Delta-Fused sobre todos los tensores, pero el trunk se modifica mediante una aproximación de bajo rango rank-1024: fl2va + rank1024(ref2va − fl2va). Los tensores de AdaLN, RMSNorm y bias se reemplazan completamente por los de ref2va. Es la variante equilibrada.
- r0: aplica la diferencia completa sin truncamiento: fl2va + (ref2va − fl2va). Equivale a adoptar la orientación de los pesos de ref2va, siendo la variante con mayor capacidad de referencia.

No se dispone de información sobre los datos de entrenamiento, número de tokens ni procesos de RLHF o DPO, ya que el modelo no ha sido entrenado. La codificación depende del modelo Qwen3-VL-32B como encoder, bajo licencia Apache 2.0.

## Capacidades

- Generación de vídeo con dos rutas funcionales: control de primer y último fotograma (fl2va) y generación condicionada por referencia de imagen, vídeo o audio (ref2va).
- Tres niveles de intensidad de referencia seleccionables mediante la carga de una u otra variante: b25-49 (referencia suave), r1024 (equilibrada) y r0 (referencia máxima).
- Soporte de referencias multimodales: imagen de referencia, vídeo de referencia y audio de referencia.
- Integración nativa en ComfyUI mediante el nodo Load Diffusion Model, sin necesidad de cargadores personalizados.
- Formato fp8_scaled compatible con hardware sin soporte FP8 nativo, ya que los pesos se des-cuantizan a FP16 durante el cálculo.
- No se documentan capacidades de tool calling, razonamiento multi-paso, ni soporte de agentes.

## Casos de uso

- Generación de vídeo a partir de una imagen de referencia: con la variante r0 o r1024, se puede animar un personaje o escena manteniendo coherencia visual con la imagen de entrada. Es útil en producción de contenido publicitario o artístico.
- Control preciso de primer y último fotograma: la variante b25-49 permite especificar los fotogramas inicial y final de una secuencia, preservando la calidad de imagen original. Adecuado para animaciones con transiciones definidas.
- Sincronización de audio y vídeo: la ruta ref2va acepta audio de referencia, lo que habilita la generación de vídeos con locuciones o efectos sonoros de referencia, por ejemplo en doblaje o creación de clips musicales.
- Ajuste de equilibrio calidad-referencia en un pipeline de ComfyUI: las tres variantes pueden cargarse en paralelo y compararse para seleccionar la más adecuada según el proyecto. Esto permite a los desarrolladores modificar la intensidad de la referencia sin cambiar de modelo.
- Investigación sobre fusión de pesos en modelos generativos: sirve como caso de estudio para analizar cómo la inyección de diferencias de pesos afecta a las capacidades de un Diffusion Transformer, sin necesidad de reentrenamiento.
- Prototipado rápido de vídeos para redes sociales: con un único checkpoint se puede generar contenido breve con estilo visual consistente a partir de una referencia, reduciendo el tiempo de experimentación.
- Generación de vídeo con referencia de vídeo: la variante r0 puede tomar un vídeo de referencia para imitar su movimiento o estilo, lo que resulta útil en la creación de variaciones de una toma original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar en la información disponible. El autor reporta métricas de proxy de similitud de pesos, que no son benchmarks de rendimiento de generación:

| Métrica de proxy | Valor |
|---|---|
| Similitud de pesos entre fl2va y ref2va | >97% de bits idénticos |
| Coseno video-latent (bloque adaln) | ≈0.505 |
| Coseno video-latent (rank-1024 delta) | ≈0.691 |
| Coseno photoreal (bloque adaln → rank-1024 delta) | 0.678 → 0.875 |

Estas métricas indican la cercanía al comportamiento de ref2va en términos de representaciones latentes, no la calidad visual o auditiva final.

## Requisitos de hardware

- VRAM estimada: aproximadamente 10 GB durante la inferencia, según el autor. Cada archivo de checkpoint ocupa unos 19.5 GB en disco.
- GPU recomendadas: NVIDIA V100 (SM 7.0) probada y estable. También se indica compatibilidad con arquitecturas Ada y Blackwell (RTX 40 y 50), que soportan FP8 nativo y ofrecen mayor velocidad.
- GPU de consumo: no se especifica una lista de GPUs de consumo compatibles. Dado el consumo de VRAM estimado de ~10 GB, es posible que tarjetas con al menos 10 GB de VRAM funcionen, aunque no está documentado.
- Opciones de despliegue: ComfyUI con el nodo Load Diffusion Model. Se recomienda el parche ComfyUI-MiniMaxH3-SolAttn-V100 para V100. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3 fl2va (oficial) | no disponible | no disponible | no disponible | MiniMax H3 Community | HuggingFace |
| MiniMax-H3 ref2va (oficial) | no disponible | no disponible | no disponible | MiniMax H3 Community | HuggingFace |
| Este modelo (b25-49) | no disponible | no disponible | no disponible | MiniMax H3 Community | HuggingFace |
| Este modelo (r1024) | no disponible | no disponible | no disponible | MiniMax H3 Community | HuggingFace |
| Este modelo (r0) | no disponible | no disponible | no disponible | MiniMax H3 Community | HuggingFace |

La principal diferencia entre estos modelos es la técnica de fusión aplicada, que se detalla en las secciones anteriores.

## Limitaciones y advertencias

- Licencia restrictiva: no es MIT. La redistribución exige incluir el texto completo de la licencia, un archivo NOTICE y una declaración de modificación. Los productos comerciales con ingresos anuales superiores a 20 millones de dólares requieren autorización escrita de MiniMax (api@minimax.io).
- Restricción geográfica: la licencia excluye explícitamente la Unión Europea, Reino Unido, Corea y Estados Unidos. Aunque el repositorio es público, para cumplir estrictamente la licencia debería configurarse como privado o con acceso restringido.
- Modelo derivado sin entrenamiento: al ser una fusión de pesos, no se han realizado evaluaciones exhaustivas de calidad ni de sesgos. El rendimiento puede variar según la tarea.
- Dependencia externa: el modelo requiere el encoder Qwen3-VL-32B, lo que añade un componente adicional al pipeline.
- Sin benchmarks oficiales: no hay resultados de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Las métricas de proxy no sustituyen la validación de rendimiento.
- Soporte limitado: solo se ha documentado el uso en ComfyUI con NVIDIA V100. El funcionamiento en otros frameworks o hardware no está verificado.
- Riesgo de alucinación visual: al ser un modelo generativo, puede producir vídeos con incoherencias o artefactos, especialmente en las variantes con mayor inyección de referencia.

## Enlaces

- Repositorio principal en Hugging Face: https://huggingface.co/xtanqn/MiniMax-H3-fl2va-ref2va-b25-49-r1024-r0
- Repositorio de variantes híbridas del autor: https://huggingface.co/xtanqn/Minimax-H3-fl2va-ref2va-hybrid-models
- Repositorio similar de la comunidad: https://huggingface.co/smhfacct/Minimax-H3-fl2va-ref2va-hybrid-models
- Modelo fuente (MiniMax AI): https://huggingface.co/MiniMaxAI/MiniMax-H3
