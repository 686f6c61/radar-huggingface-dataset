# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-resume80-step200

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8 es un ajuste fino del modelo base Qwen/Qwen3.5-4B-Base, desarrollado por el usuario thkim0305-SNU, orientado a la alineación de seguridad mediante aprendizaje por refuerzo con el algoritmo GRPO (Group Relative Policy Optimization). El modelo parte de la arquitectura multimodal Qwen3.5 de 4B parámetros (4.659.865.088 parámetros reales según los pesos en safetensors) y conserva la torre de visión del modelo base, por lo que mantiene la capacidad image-text-to-text.

La relevancia de esta ficha es doble: por un lado, documenta un experimento de safety tuning con hiperparámetros concretos (learning rate 2e-6, coeficiente KL 0.001, 15 prompts y 8 respuestas por actualización, 200 pasos de optimización); por otro, ilustra el ecosistema de checkpoints intermedios que se publican en Hugging Face a partir de recetas de RL. El nombre del repositorio codifica la práctica totalidad de la configuración del entrenamiento, lo que facilita la trazabilidad, aunque la model card es extremadamente escueta y no incluye datos de evaluación.

Se trata de un checkpoint de investigación con solo 2 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados ni documentación sobre el dataset de seguridad empleado. Cualquier uso en producción debería ir precedido de una evaluación propia de seguridad, sesgos y capacidad multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5), con torre de visión y pesos MTP (multi-token prediction) heredados del modelo base |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni AWQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3.5 del checkpoint base Qwen/Qwen3.5-4B-Base (revisión 1001bb4d826a52d1f399e183466143f4da7b741b), incluyendo la torre de visión y los pesos MTP (multi-token prediction) sin entrenar, según indica la model card. El ajuste fino se realizó con GRPO, un algoritmo de optimización de política proximal sin modelo crítico separado que estima ventajas relativas dentro de un grupo de respuestas generadas para cada prompt.

Los hiperparámetros documentados son: learning rate 2e-6, coeficiente de divergencia KL 0.001 frente a la política de referencia, 15 prompts por actualización con 8 respuestas muestreadas por prompt (k=8), y 200 actualizaciones del optimizador completadas (iteración Megatron 199). El identificador del run (grpo-mixture8-qwen35base4b-lr2e6-resume80-save40-pro6000-gpu0123-20261119-v1) sugiere un dataset mixto de 8 componentes, reanudación desde el paso 80, guardado cada 40 pasos y un total previsto de 6000 pasos, ejecutado sobre 4 GPUs. No se detalla la composición del dataset de seguridad, el número de tokens de entrenamiento ni si hubo etapas previas de SFT o DPO.

## Capacidades

- Generación de texto conversacional en formato chat (tag `conversational`).
- Procesamiento conjunto de imagen y texto (pipeline `image-text-to-text`), con torre de visión heredada del modelo base.
- Razonamiento y generación de código y matemáticas: capacidades presumibles del base Qwen3.5-4B, no verificadas en este checkpoint.
- Tool calling y function calling: no documentado en la model card; depende de las capacidades del base y de que el ajuste GRPO no las haya degradado.
- Uso como agente multi-paso: no documentado.
- Capacidades multilingües: no documentadas (el campo de idiomas no está disponible).
- Modo thinking explícito: no documentado.
- Alineación de seguridad: objetivo declarado del ajuste mediante GRPO con penalización KL.

## Casos de uso

- Investigación en safety tuning: servir como checkpoint de referencia para reproducir o comparar recetas GRPO sobre Qwen3.5-4B, dado que el nombre del repositorio y la model card exponen learning rate, KL, tamaño de grupo y número de pasos.
- Evaluación de alineación: medir la tasa de rechazo ante prompts dañinos y la degradación de capacidades generales frente al base, usando suites propias de red teaming.
- Clasificación y moderación multimodal: aprovechar la entrada image-text-to-text para analizar capturas o imágenes acompañadas de texto en pipelines de moderación de contenido.
- Generación de respuestas seguras en asistentes conversacionales: desplegar el modelo en un entorno controlado con filtros adicionales, validando antes que el ajuste no ha introducido respuestas excesivamente restrictivas.
- Estudio de la tensión seguridad-utilidad: comparar curvas de rendimiento en tareas benignas (código, matemáticas) frente al modelo base para cuantificar el coste de la alineación.
- Base para ajustes posteriores: utilizar el checkpoint como punto de partida de SFT o DPO específicos de dominio, dado que la licencia Apache 2.0 permite uso comercial y modificación.
- Prototipado de asistentes con visión en local: con 4,66B parámetros, es viable en GPUs de consumo con cuantización, aunque este checkpoint solo se distribuye en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 12-16 GB para contexto moderado.
- Cuantización a 8 bits: alrededor de 5 GB de pesos; a 4 bits, alrededor de 2,5-3 GB, aunque el repositorio no publica versiones GGUF ni AWQ y habría que generarlas.
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y evaluación a gran escala; RTX 4090 (24 GB) o L40S para inferencia en BF16 con contexto largo.
- GPU de consumo: cabe en RTX 3090/4090 en BF16 y en GPUs de 8-12 GB si se cuantiza a 4-8 bits.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI para serving; llama.cpp/Ollama requerirían conversión previa a GGUF, no disponible en el repo.
- Latencia y throughput: no disponibles; dependen del hardware, la cuantización y la longitud de contexto, que tampoco se documenta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8 (este) | 4,66B | no disponible | imagen-texto | Apache 2.0 | Checkpoint GRPO de investigación, sin benchmarks |
| Qwen/Qwen3.5-4B-Base | 4B (aprox.) | no disponible | imagen-texto | Apache 2.0 | Modelo base sin ajuste de seguridad; referencia directa |
| Qwen2.5-VL-3B-Instruct | 3B (aprox.) | 32k (según documentación pública de la familia Qwen2.5-VL) | imagen-texto | Apache 2.0 | Alternativa multimodal pequeña con instrucciones y benchmarks publicados |
| Llama 3.2 3B Instruct | 3B (aprox.) | 128k (según documentación pública) | texto | Llama Community License | Alternativa solo texto, sin visión, con restricciones de licencia |

La comparación con Qwen2.5-VL-3B-Instruct y Llama 3.2 3B se ofrece como referencia de categoría; no se dispone de métricas de este checkpoint para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones de seguridad, por lo que el efecto real del ajuste GRPO es desconocido.
- Model card mínima: no se documenta el dataset de seguridad, la composición del "mixture8", la longitud de contexto ni los idiomas soportados.
- Riesgo de alucinación: inherente a los modelos de 4B parámetros; sin evaluación específica en este checkpoint.
- Sesgos: no evaluados; el ajuste de seguridad puede introducir sobre-rechazo o sesgos de estilo en las respuestas.
- Degradación de capacidades: el entrenamiento con GRPO y KL 0.001 durante 200 pasos puede haber afectado a habilidades del base (código, matemáticas, visión), algo que debe verificarse empíricamente.
- Idiomas: el campo de idiomas no está disponible; no se garantiza un rendimiento multilingüe equivalente al del base.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de validar la seguridad recae en el integrador.
- Checkpoint intermedio: el nombre indica "resume80-step200" dentro de un plan de 6000 pasos, por lo que probablemente no es el resultado final de la receta.
- Repositorio de 9,3 GB con solo 2 descargas: sin comunidad que haya validado su comportamiento; tratar como experimental.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-resume80-step200
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Perfil del autor: https://huggingface.co/thkim0305-SNU
- Paper de GRPO (DeepSeekMath): https://arxiv.org/abs/2402.03300
- Documentación de TRL sobre GRPO: https://huggingface.co/docs/trl/main/en/grpo_trainer
