# WijewardhanaNT/xnli_stage2_hi_10000

## Resumen

`WijewardhanaNT/xnli_stage2_hi_10000` es un adaptador LoRA (PEFT) publicado en HuggingFace por el usuario WijewardhanaNT, construido sobre el modelo base `meta-llama/Llama-2-7b-hf`. El nombre del repositorio sugiere un ajuste fino orientado a la tarea XNLI (inferencia de lenguaje natural multilingue) en su fase 2, con un subconjunto de 10.000 ejemplos y el codigo de idioma `hi` (hindi), aunque la model card no confirma explicitamente esta interpretacion. El repositorio contiene unicamente los pesos del adaptador (0,5 GB), no el modelo completo.

La relevancia de esta ficha es limitada: se trata de un artefacto de investigacion sin documentacion tecnica, sin metricas publicadas, sin licencia declarada y con cero descargas en el momento de la consulta. No es un modelo listo para produccion, sino un experimento de ajuste fino que puede servir como referencia para quienes trabajen en adaptadores LoRA sobre Llama 2 para tareas de NLI multilingue.

La model card es la plantilla por defecto de HuggingFace sin rellenar: todos los campos de descripcion, entrenamiento, evaluacion y uso previsto aparecen como "[More Information Needed]". Por tanto, la mayoria de los datos tecnicos de esta ficha se derivan del modelo base y de la convencion de nombres, y se marcan explicitamente como no confirmados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Llama 2 |
| Parametros totales | No disponible para el adaptador; modelo base: 7.000 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en el adaptador; modelo base Llama 2: 4.096 tokens |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; admite combinacion con el base en 4/8 bits via bitsandbytes, no documentado por el autor) |
| Idiomas soportados | No disponible; el sufijo `hi` del nombre sugiere hindi, sin confirmar |
| Licencia | No disponible (el modelo base Llama 2 tiene Llama 2 Community License) |
| Formato de pesos | safetensors (adaptador PEFT); requiere el base en safetensors o cuantizado |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango sobre `meta-llama/Llama-2-7b-hf`, un transformer decoder-only con 7.000 millones de parametros, atencion causal estandar y 4.096 tokens de contexto. El adaptador se carga mediante la libreria `peft` (version 0.21.0 segun la model card) y `transformers`, y modifica un subconjunto de las matrices de proyeccion del modelo base. El rango, alpha, dropout y modulos objetivo del LoRA no estan documentados.

El nombre `xnli_stage2_hi_10000` apunta a un entrenamiento en dos fases sobre el corpus XNLI (Cross-lingual Natural Language Inference), con 10.000 ejemplos y el idioma hindi en la segunda etapa. No hay informacion sobre el dataset exacto, la composicion, el numero de tokens vistos, hiperparametros de entrenamiento, precision (fp16/bf16) ni si hubo RLHF o DPO. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto autoregresiva heredada de Llama 2 7B (el adaptador no anade capacidades nuevas, solo ajusta el comportamiento hacia la tarea de entrenamiento).
- Clasificacion de pares de frases para inferencia de lenguaje natural (entailment, neutral, contradiction), segun la convencion del nombre del repositorio, sin confirmar.
- Posible especializacion en hindi si el sufijo `hi` corresponde al idioma de entrenamiento, sin confirmar.
- Soporte multilingue limitado al que tenga el modelo base y al subconjunto de datos usado; no documentado.
- Tool calling / function calling: no documentado; Llama 2 7B base no lo soporta de forma nativa.
- Razonamiento multi-paso y uso como agente: no documentado.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Experimentacion academica en NLI multilingue: cargar el adaptador sobre Llama 2 7B con `peft` para reproducir o comparar resultados en XNLI hindi, como punto de partida para nuevas variantes de ajuste.
- Baseline para investigacion en adaptadores LoRA: utilizar el repositorio como referencia de configuracion (rango, modulos, datos) en estudios sobre eficiencia de fine-tuning, aunque el autor no documenta los hiperparametros.
- Evaluacion de tecnicas de merging de adaptadores: combinar este LoRA con otros adaptadores sobre el mismo base para estudiar interferencia entre tareas.
- Analisis de sesgos en modelos ajustados: comparar las respuestas del base frente al adaptador en pares de frases en hindi para detectar cambios de sesgo introducidos por el fine-tuning.
- Prototipado de clasificadores de pares de frases: usar el adaptador como cabecera generativa para tareas de entailment en un pipeline de investigacion, nunca en produccion sin evaluacion previa.
- Docencia y formacion: ejemplo practico de como se publica y se carga un adaptador PEFT sobre un modelo grande, util en cursos de NLP aplicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion, y el repositorio no enlaza a ningun paper, informe o tabla de resultados.

## Requisitos de hardware

- VRAM para el adaptador solo: inferior a 1 GB (0,5 GB en disco).
- VRAM para inferencia conjunta base + adaptador en fp16: aproximadamente 14 GB (7B parametros a 2 bytes por parametro, mas overhead de activaciones y KV cache).
- VRAM en cuantizacion 8 bits (bitsandbytes): aproximadamente 8-9 GB.
- VRAM en cuantizacion 4 bits (bitsandbytes o GPTQ/AWQ del base): aproximadamente 5-6 GB.
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento o evaluacion a gran escala; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en fp16; RTX 4080/4070 Ti (16 GB) o superiores para inferencia en 8 bits.
- Cabe en GPU de consumo: si, con cuantizacion 4 u 8 bits, en tarjetas con al menos 8 GB de VRAM (por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB).
- Opciones de despliegue: `transformers` + `peft` (ruta nativa), `vLLM` con soporte de adaptadores LoRA, `llama.cpp`/`Ollama` tras convertir el base a GGUF y fusionar el adaptador, `TGI` con adaptadores (soporte variable segun version).
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion, y el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WijewardhanaNT/xnli_stage2_hi_10000 | Adaptador sobre 7B | 4.096 (base) | LoRA PEFT | No disponible | HuggingFace, 0 descargas |
| meta-llama/Llama-2-7b-hf | 7B | 4.096 | Base denso | Llama 2 Community License | HuggingFace, ampliamente usado |
| Adaptadores XNLI publicos sobre Llama 2 | Variable | 4.096 (base) | LoRA PEFT | Variable | Depende del autor |
| Modelos NLI multilingues dedicados (p. ej. XLM-R large) | ~560M | 512 | Encoder | MIT / CC-BY-NC segun variante | HuggingFace |

La comparacion con XLM-R es relevante porque los modelos encoder dedicados a NLI suelen superar en eficiencia y precision a un decoder de 7B ajustado con LoRA para la misma tarea, con un coste de inferencia mucho menor. No se dispone de datos de rendimiento del adaptador para cuantificar la diferencia.

## Limitaciones y advertencias

- Model card sin rellenar: no hay informacion sobre datos de entrenamiento, hiperparametros, evaluacion ni uso previsto; cualquier uso en produccion es arriesgado.
- Licencia no declarada: no se puede asumir uso comercial; ademas, el modelo base Llama 2 impone la Llama 2 Community License, con restricciones de uso (por ejemplo, umbral de 700 millones de usuarios mensuales para licencia comercial adicional).
- Riesgo de alucinacion: al ser un modelo generativo de 7B, puede producir texto plausible pero incorrecto, especialmente fuera de la tarea de ajuste.
- Sesgos: heredados de los datos de preentrenamiento de Llama 2 y del subconjunto de XNLI usado; no evaluados por el autor.
- Limitacion idiomatica: si el adaptador se entreno solo en hindi, su comportamiento en castellano u otros idiomas puede degradarse respecto al base.
- Cero descargas y cero likes: sin validacion por parte de la comunidad; no hay evidencia de que el adaptador funcione segun lo esperado.
- Sin informacion sobre el rango LoRA ni los modulos objetivo: dificil de reproducir o de combinar con otros adaptadores.
- No apto para tool calling ni agentes sin ingenieria adicional, ya que Llama 2 7B no fue entrenado para ello.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/WijewardhanaNT/xnli_stage2_hi_10000
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Paper de referencia citado en la model card (Lacoste et al., 2019, impacto ambiental): https://arxiv.org/abs/1910.09700
- Libreria PEFT: https://github.com/huggingface/peft
- Dataset XNLI (referencia para la tarea inferida): https://huggingface.co/datasets/facebook/xnli
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
