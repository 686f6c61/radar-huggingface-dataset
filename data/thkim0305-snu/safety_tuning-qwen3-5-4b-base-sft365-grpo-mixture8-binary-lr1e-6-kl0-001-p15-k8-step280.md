# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT365-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step280

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-SFT365-GRPO-Mixture8 es un checkpoint intermedio de un proceso de ajuste fino con aprendizaje por refuerzo (GRPO) orientado a la seguridad, desarrollado por el usuario thkim0305-SNU. El modelo parte de Qwen3.5-4B-Base, pasa por un ajuste supervisado (SFT) y se somete a 280 actualizaciones de optimizador de RL de seguridad sobre un conjunto de prompts denominado "mixture-8". El autor indica explicitamente que el entrenamiento sigue en curso y que este checkpoint es una instantanea, no un modelo final.

Se trata de un modelo multimodal de tipo image-text-to-text con arquitectura Qwen3.5, 4.659.865.088 parametros totales (4,66 mil millones) y pesos en bf16. La torre de vision y la cabeza MTP conservan los pesos originales del modelo base; solo se ha entrenado el modelo de lenguaje. El checkpoint se carga exactamente igual que el modelo base mediante `Qwen3_5ForConditionalGeneration`.

Su relevancia es fundamentalmente metodologica: documenta con detalle la receta de RL (algoritmo GRPO, framework Slime + Megatron-LM, juez binario Qwen3.8-27B) y la evolucion del reward a lo largo de las actualizaciones, lo que lo convierte en material de referencia para investigacion en alineamiento y seguridad de agentes con uso de herramientas. No obstante, al ser un checkpoint intermedio con cero descargas y cero likes, no debe considerarse un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (`Qwen3_5ForConditionalGeneration`), torre de vision + cabeza MTP + modelo de lenguaje |
| Parametros totales | 4.659.865.088 (4,66 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens (contexto de entrenamiento/sampling) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato Hugging Face, bf16) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Qwen3.5 en su variante condicional para generacion, con tres componentes: una torre de vision, una cabeza MTP (multi-token prediction) y el modelo de lenguaje. En este checkpoint solo se ha entrenado el modelo de lenguaje; la torre de vision y la cabeza MTP son los pesos intactos del modelo base. La exportacion desde Megatron se realizo con `safety_tuning.hf_export`, re-fusionando las proyecciones GDN, aplicando el mapeo de nombres de Slime para Qwen3.5, copiando los pesos de vision/MTP del base y ajustando los dtypes al indice del modelo original.

El entrenamiento combina un SFT previo (checkpoint de partida `SFT-Mixture8-genv2gp3-lr1e-5-step365`) con RL mediante GRPO de recompensas binarias normalizadas por grupo, clip PPO de 0,2 y TIS activado. El framework es Slime (rollouts con SGLang, colocados) junto con Megatron-LM en bf16. Por cada actualizacion se generan 15 prompts x 8 rollouts = 120 secuencias, con learning rate constante de 1e-6, AdamW con betas [0,9; 0,95], weight decay 0,1 y grad clip 1,0. Se aplica una perdida KL de baja varianza contra el checkpoint de partida con coeficiente 0,001. El sampling usa temperatura 1,0, top-p 1, hasta 32.768 tokens generados y contexto de 40.960. Se activa el modo thinking mediante la plantilla de chat de Qwen (`enable_thinking=true`) y el function calling `qwen3_coder` en los rollouts con herramientas. La recompensa la otorga un juez Qwen3.8-27B con veredicto binario estricto (0/1) segun la especificacion del proyecto; los prompts de AgentAlign se juzgan sobre toda la trayectoria visible de uso de herramientas. El schedule cubre una epoca con padding sobre 11.794 prompts unicos (787 actualizaciones), con checkpoints cada 40 actualizaciones.

El conjunto de datos "mixture-8" se compone de: star1_gp3 (1.000 prompts), star_benign_v2 (915), agentalign_harmful (2.000), agentalign_benign (2.000), codesafetybench (900), magicoder (1.000), difficult_advice (1.982) y wildjailbreak_benign (1.997). 4.000 prompts de AgentAlign incorporan definiciones sinteticas de herramientas y se despliegan como trayectorias multiturno contra un simulador, con las salidas de herramienta enmascaradas en la perdida. El run se ejecuto en 4x H100 80GB: juez con TP2 en las GPU 4-5, entrenador en la GPU 6 (estado del optimizador en CPU) y motor de rollout en la GPU 7.

## Capacidades

- Generacion de texto conversacional multiturno con plantilla de chat de Qwen.
- Modo thinking activable (`enable_thinking=true`), orientado a razonamiento antes de responder.
- Entrada de imagen y texto (pipeline image-text-to-text), aunque la torre de vision no se ha entrenado en este checkpoint.
- Tool calling / function calling mediante el formato `qwen3_coder`.
- Razonamiento agéntico multi-paso: los rollouts de AgentAlign simulan trayectorias de uso de herramientas contra un simulador.
- Generacion de codigo, con enfasis en seguridad de codigo (dataset codesafetybench y magicoder).
- Comportamiento orientado a seguridad: rechazo de peticiones daninas (agentalign_harmful, star1_gp3) y utilidad en peticiones benignas (agentalign_benign, wildjailbreak_benign, star_benign_v2).
- Capacidades multilingues: no disponible (no se documentan idiomas).

## Casos de uso

- Investigacion en alineamiento y RLHF/RLVR: sirve como referencia reproducible de una receta GRPO completa (hiperparametros, juez, schedule y curvas de reward) para replicar o comparar experimentos de seguridad.
- Evaluacion de robustez frente a jailbreaks: el checkpoint incorpora entrenamiento explicito con wildjailbreak_benign y star1_gp3, lo que permite medir la tasa de rechazo ante prompts adversarios en pipelines de red teaming.
- Agentes con uso de herramientas en entornos simulados: al haberse entrenado con trayectorias multiturno de AgentAlign contra un simulador, es adecuado para probar politicas de llamada a funciones antes de desplegarlas contra APIs reales.
- Revision de seguridad de codigo generado: el entrenamiento con codesafetybench y magicoder permite usar el modelo como generador de codigo con sesgo hacia practicas seguras en tareas de asistencia al desarrollo.
- Filtrado y moderacion de contenido en prototipos: su comportamiento entrenado para rechazar peticiones daninas y aceptar benignas encaja en experimentos de clasificacion de peticiones, siempre con validacion humana.
- Estudio de la evolucion del reward por dominio: las tablas publicadas por dataset y ventana de actualizaciones permiten analizar que dominios mejoran antes (star1_gp3, codesafetybench) y cuales oscilan (magicoder, agentalign_benign).
- Base para continuar el entrenamiento: al ser un checkpoint intermedio con licencia Apache 2.0, puede usarse como punto de partida para completar las 787 actualizaciones previstas o para ablaciones de hiperparametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor unicamente reporta la puntuacion media del juez binario durante el entrenamiento (reward crudo antes de normalizacion por grupo):

| Ventana (actualizaciones) | Puntuacion media | Rollouts juzgados |
|---|---|---|
| 0-10 | 0,735 | 1200 |
| 30-40 | 0,718 | 1200 |
| 70-80 | 0,813 | 1200 |
| 110-120 | 0,817 | 1200 |
| 150-160 | 0,857 | 1200 |
| 190-200 | 0,868 | 1200 |
| 230-240 | 0,857 | 1200 |
| 270-280 | 0,880 | 1200 |

Desglose por dataset en la ventana final (270-280) frente a la inicial (0-10):

| Dataset | 0-10 | 270-280 |
|---|---|---|
| agentalign_benign | 0,48 | 0,71 |
| agentalign_harmful | 0,96 | 0,94 |
| codesafetybench | 0,65 | 0,95 |
| difficult_advice | 0,88 | 0,95 |
| magicoder | 0,38 | 0,71 |
| star1_gp3 | 0,77 | 0,96 |
| star_benign_v2 | 0,72 | 0,79 |
| wildjailbreak_benign | 0,68 | 0,95 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos (tamano del repo), mas overhead de activaciones y cache KV; en la practica se recomienda entre 12 y 16 GB para contexto moderado.
- En cuantizacion de 8 bits, el peso se reduce a unos 4,7 GB; en 4 bits, a unos 2,4 GB (estimaciones teoricas a partir del numero de parametros; el autor no publica cuantizaciones).
- GPU recomendadas: H100 80GB o A100 80GB para el entrenamiento tal como se ejecuto (4x H100 en el run documentado); para inferencia basta una sola GPU de 16-24 GB.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas (RTX 3060 12GB, RTX 4070 Ti, RTX 4080, RTX 4090) usando bf16 o cuantizacion.
- Opciones de despliegue: transformers (receta oficial de la model card), vLLM, TGI y llama.cpp/Ollama previa conversion a GGUF (no se publican GGUF oficiales). El checkpoint es compatible con endpoints.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-SFT365-GRPO-Mixture8 (este) | 4,66 mil M | 40.960 | Apache 2.0 | RL de seguridad sobre Qwen3.5-4B, checkpoint intermedio |
| Qwen3.5-4B-Base (modelo de partida) | 4 mil M (aprox.) | no disponible en esta ficha | Apache 2.0 | Modelo base multimodal sin ajuste de seguridad |
| Checkpoint SFT previo (SFT-Mixture8-genv2gp3-lr1e-5-step365) | 4,66 mil M | no disponible en esta ficha | Apache 2.0 | SFT sin RL de seguridad |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoria en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, licencia y enfoque de entrenamiento.

## Limitaciones y advertencias

- Checkpoint intermedio: el entrenamiento sigue en curso (280 de 787 actualizaciones previstas); el rendimiento no representa el del modelo final.
- El reward depende de un juez automatico (Qwen3.8-27B) con veredicto binario estricto; puede introducir sesgos del juez y sobreajuste a su criterio.
- Riesgo de alucinacion no evaluado: no se publican benchmarks de veracidad ni de conocimiento factual.
- Idiomas soportados no documentados; no se garantiza cobertura multilingue.
- La torre de vision y la cabeza MTP no se han entrenado: las capacidades visuales corresponden al modelo base y no han sido evaluadas en este checkpoint.
- Oscilacion del reward en algunos dominios: magicoder sube de 0,38 a 0,71 pero con caidas intermedias (0,19 en 70-80), y agentalign_benign baja de 0,71 a 0,61 en la ventana 230-240; indica inestabilidad del entrenamiento.
- Sin descargas ni likes ni validacion externa: no hay evidencia de uso en produccion por terceros.
- Licencia Apache 2.0 permite uso comercial, pero el modelo hereda las condiciones del modelo base Qwen3.5-4B-Base; conviene revisar el LICENSE enlazado por el autor.
- No apto como unico filtro de seguridad en produccion: requiere validacion humana y capas adicionales de moderacion.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT365-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step280
- Modelo base del checkpoint: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr1e-5-step365
- Modelo original Qwen3.5-4B-Base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
