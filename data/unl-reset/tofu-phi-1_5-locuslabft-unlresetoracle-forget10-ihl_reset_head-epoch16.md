# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch16

## Resumen

Este repositorio contiene un checkpoint completo del modelo Phi-1.5 (1.418 millones de parametros) resultado de un experimento de *machine unlearning* sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). El modelo parte de `locuslab/tofu_ft_phi-1.5`, un fine-tune de Phi-1.5 sobre TOFU, y aplica una receta concreta: reinicializa los embeddings de entrada y la cabeza del modelo de lenguaje desde `microsoft/phi-1_5` original, mientras conserva el resto de pesos del transformer del modelo fine-tuneado. Sobre esa base se entrena con una combinacion de pérdida de entropía inversa (IHL, *inverse hyperbolic loss*) sobre el conjunto *forget* y entropía cruzada (CE) con peso 1.0 sobre el conjunto *retain*.

El objetivo es borrar el conocimiento de un subconjunto concreto de datos (TOFU `forget10`, es decir, el 10 % de los autores ficticios del dataset) sin degradar el rendimiento en el resto. Es un artefacto de investigación, no un modelo de produccion: su proposito es servir de referencia reproducible en la literatura de unlearning y evaluar hasta que punto una tecnica de reinicializacion parcial combinada con IHL preserva utilidad mientras olvida.

El checkpoint corresponde a la epoca 16 de 20 del entrenamiento. El modelo es de tipo decoder-only transformer, con licencia Apache 2.0 y pesos en formato safetensors. No se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con `custom_code` |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Phi-1.5; no confirmada en la informacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Phi-1.5, con aproximadamente 1.400 millones de parametros. La innovacion del checkpoint no esta en la arquitectura, sino en el procedimiento de unlearning: los embeddings de entrada y la cabeza de lenguaje (LM head) se reinicializan desde el Phi-1.5 original de Microsoft, mientras que el resto de pesos del transformer se mantienen del fine-tune `locuslab/tofu_ft_phi-1.5`. Esta reinicializacion selectiva busca eliminar la asociacion directa entre tokens y conocimiento memorizado sin destruir las representaciones internas aprendidas.

El entrenamiento combina dos objetivos: una pérdida de entropía inversa (IHL) aplicada sobre el conjunto *forget* de TOFU (`forget10`, el 10 % de los autores ficticios) y una entropía cruzada estándar con coeficiente 1.0 sobre el conjunto *retain*. El checkpoint publicado corresponde a la epoca 16 de un total de 20. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron fases de RLHF o DPO. El repositorio incluye un fichero `ihl_manifest.json` con metadatos del procedimiento.

## Capacidades

- Generacion de texto en ingles como modelo base de la familia Phi-1.5.
- Razonamiento basico y respuesta a preguntas de dominio general, condicionado por el fine-tune sobre TOFU.
- Capacidad de *unlearning* verificable: el checkpoint esta disenado para que el conocimiento del subconjunto `forget10` de TOFU sea evaluable como olvidado.
- Preservacion del rendimiento en el conjunto *retain* gracias al termino de entropia cruzada durante el entrenamiento.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma especifica; el modelo base no esta optimizado para ello.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Evaluacion de tecnicas de unlearning: el checkpoint sirve como referencia reproducible para comparar metodos de borrado de conocimiento sobre TOFU `forget10`, midiendo la fidelidad del olvido frente a la utilidad retenida.
- Investigacion en privacidad de modelos: permite estudiar si la reinicializacion de embeddings y LM head reduce la memorizacion de datos sensibles sin reentrenar el modelo completo.
- Reproducibilidad de experimentos: al publicarse como checkpoint completo con manifiesto (`ihl_manifest.json`), facilita la replicacion de resultados en papers de unlearning.
- Analisis de degradacion controlada: util para medir la curva de utilidad frente a epocas de entrenamiento (aqui, epoca 16 de 20) y decidir puntos de parada.
- Baseline en competiciones y benchmarks de TOFU: sirve como punto de comparacion para metodos como GradDiff, NPO o variantes de reset parcial.
- Estudio de la interaccion entre inicializacion y olvido: permite aislar el efecto de reinicializar solo embeddings y LM head frente a reinicializaciones mas agresivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8-3,2 GB solo para pesos, mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,5-1,8 GB.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 1,0-1,2 GB (no confirmada para este checkpoint).
- GPU recomendadas: cualquier GPU consumer moderna con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) para FP16; A100 o H100 no son necesarias dado el tamano.
- Cabe en GPU consumer: si, en la mayoria de GPU con 8 GB o mas en FP16 y en GPU con 4-6 GB si se cuantiza.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (el modelo usa `custom_code`), llama.cpp u Ollama si se generan pesos GGUF (no incluidos en el repo), vLLM y TGI previa conversion.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Este checkpoint (TOFU Phi-1.5, forget10, ep. 16) | 1.418 M | no disponible | Apache 2.0 | Unlearning con reset de embeddings/LM head + IHL |
| microsoft/phi-1_5 | 1.300 M aprox. | 2.048 tokens (referencia del modelo base) | MIT (modelo original) | Modelo base de generacion de texto y codigo |
| locuslab/tofu_ft_phi-1.5 | 1.300 M aprox. | 2.048 tokens (referencia) | Apache 2.0 (repo del fine-tune) | Fine-tune sobre TOFU sin unlearning |
| Otros checkpoints `unl-reset` (mismas variantes) | ~1.418 M | no disponible | Apache 2.0 | Distintas epocas y configuraciones del mismo procedimiento |

La comparacion con alternativas de unlearning especificas (NPO, GradDiff, etc.) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: no esta disenado ni validado para uso en produccion.
- El olvido no es garantizable: tecnicas de unlearning pueden ser revertidas mediante *jailbreaks* o ataques de extraccion; no debe tratarse como borrado seguro de datos.
- Riesgo de alucinacion: inherente al modelo base Phi-1.5, especialmente en dominios factuales.
- Idioma: solo ingles segun la etiqueta del repositorio; el rendimiento en castellano no esta garantizado.
- Longitud de contexto: no confirmada en la informacion disponible; se asume la del modelo base, pero debe verificarse antes de usarlo con prompts largos.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar codigo del autor del repositorio.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero las implicaciones eticas y legales del unlearning no estan cubiertas por la licencia.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso o validacion por terceros.
- El checkpoint corresponde a la epoca 16 de 20; no es el punto final del entrenamiento y puede presentar un equilibrio distinto entre olvido y utilidad que la epoca final.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch16
- Modelo base del fine-tune: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original Phi-1.5: https://huggingface.co/microsoft/phi-1_5
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
