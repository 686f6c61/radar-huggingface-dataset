# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch08

## Resumen

Este modelo es un checkpoint de investigación derivado de `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el usuario `unl-reset` como parte de experimentos de desaprendizaje (machine unlearning) orientados a eliminar el conocimiento de un subconjunto concreto del dataset, en este caso la partición "forget10" (el 10 % de los autores ficticios que se pretende olvidar).

El modelo conserva la arquitectura transformer densa de Phi-1.5, con 1.418.270.720 parámetros, y aplica una estrategia híbrida: reinicializa los embeddings de entrada y la cabeza del modelo de lenguaje desde el Phi-1.5 original, mientras mantiene el resto de pesos del modelo ajustado con TOFU. Sobre esa base se entrena con una pérdida combinada de entropía cruzada inversa (IHL) sobre el conjunto a olvidar y entropía cruzada estándar (CE) sobre el conjunto a retener.

Es relevante porque forma parte de la línea de trabajo que evalúa hasta qué punto es posible borrar información de un modelo sin degradar su utilidad general, un problema central para el cumplimiento normativo (RGPD, derechos de supresión) y para la investigación en seguridad de modelos. No es un modelo pensado para producción: es un artefacto de evaluación con 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Phi-1.5), con `custom_code` en el repositorio |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Phi-1.5 base usa 2048 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | ingles (`en`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano del repo: 2.8 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5: un transformer decoder-only denso de aproximadamente 1.400 millones de parametros, disenado originalmente por Microsoft Research para razonamiento basico y generacion de codigo en modelos de pequeno tamano. El checkpoint aqui descrito no modifica esa arquitectura; lo que cambia es el regimen de inicializacion y el objetivo de entrenamiento.

Segun la model card, los embeddings de entrada y la cabeza del modelo de lenguaje se inicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del modelo `locuslab/tofu_ft_phi-1.5`. El entrenamiento combina una perdida de entropia cruzada inversa (IHL) sobre el conjunto "forget" con un termino de entropia cruzada estandar (CE) ponderado por 1.0 sobre el conjunto "retain". El checkpoint corresponde a la epoca 8 de 20. El repositorio incluye un fichero `ihl_manifest.json` con metadatos del proceso, y el tag `custom_code` indica que la carga requiere `trust_remote_code=True`.

## Capacidades

- Generacion de texto en ingles con el estilo y las capacidades heredadas de Phi-1.5.
- Razonamiento basico de tipo chain-of-thought de corto alcance, limitado por el tamano del modelo.
- Generacion de codigo simple, capacidad caracteristica de la familia Phi-1.5.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso con herramientas.
- Capacidad multilingue limitada al ingles segun los metadatos del repositorio.
- No dispone de vision, audio ni modo "thinking" explicito.
- Su capacidad diferencial es la de servir como artefacto de evaluacion de desaprendizaje, no como asistente general.

## Casos de uso

- Evaluacion de metodos de desaprendizaje: el checkpoint permite medir la eficacia del olvido sobre la particion forget10 comparando la perplejidad y la exactitud en el conjunto a olvidar frente al modelo original `locuslab/tofu_ft_phi-1.5`.
- Investigacion en privacidad y cumplimiento: sirve como referencia empirica para estudiar si es posible eliminar la memorizacion de datos concretos sin reentrenar desde cero, un requisito habitual en escenarios de derecho de supresion.
- Reproducibilidad de experimentos: al ser un checkpoint completo y autonomo con manifiesto incluido, permite repetir las condiciones del entrenamiento (epoca 8 de 20, ponderacion 1.0 de CE sobre retain) en laboratorios academicos.
- Analisis de degradacion de utilidad: comparando este modelo con el base se puede cuantificar la perdida de rendimiento general que introduce el termino IHL, informacion util para disenar regularizadores mas suaves.
- Docencia en seguridad de modelos: adecuado para practicas de laboratorio sobre olvido selectivo, dado su tamano reducido (2.8 GB) y su licencia permisiva.
- Estudio de inicializacion selectiva: permite analizar el efecto de reinicializar embeddings y cabeza frente a mantenerlos, un ablacion relevante para quienes investigan tecnicas de "reset" parcial.
- Linea base en competiciones o benchmarks de unlearning: util como punto de comparacion para metodos alternativos (gradient ascent, preference optimization, etc.) sobre TOFU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16: aproximadamente 2.8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para inferencia con contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: en torno a 1.5-2 GB de pesos; en 4 bits, alrededor de 0.8-1 GB, aunque no se distribuyen ficheros GGUF oficiales.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070) es suficiente en FP16; A100 o H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, practicamente en cualquier tarjeta moderna con 6-8 GB de VRAM.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la via natural; llama.cpp u Ollama requeririan conversion manual a GGUF, no publicada. vLLM y TGI podrian funcionar si el `custom_code` es compatible, algo no confirmado.
- Latencia y throughput estimados: no disponibles; por el tamano, se espera un throughput alto en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`unl-reset/tofu-phi-1_5-...forget10...`) | 1.418 M | no disponible | apache-2.0 | Desaprendizaje TOFU (IHL + reset) | HuggingFace, 0 descargas |
| `locuslab/tofu_ft_phi-1.5` | ~1.400 M | no disponible | no disponible en esta ficha | Ajuste fino completo sobre TOFU | HuggingFace |
| `microsoft/phi-1_5` | ~1.400 M | 2048 (segun documentacion de Phi-1.5) | MIT (segun documentacion original) | Modelo base de lenguaje y codigo | HuggingFace, ampliamente usado |
| `microsoft/phi-2` | ~2.700 M | 2048 | MIT | Modelo base mas grande de la familia | HuggingFace |

La comparacion con Phi-2 es relevante porque, a igualdad de familia, duplica parametros y suele superar a Phi-1.5 en razonamiento y codigo; no obstante, este checkpoint no busca competir en rendimiento general, sino servir como artefacto de investigacion en olvido selectivo.

## Limitaciones y advertencias

- Es un checkpoint de investigacion, no un modelo listo para produccion; no hay pipeline declarado ni demos publicadas.
- El entrenamiento con IHL puede degradar el rendimiento general del modelo fuera del conjunto retain, algo que debe medirse antes de cualquier uso.
- Riesgo de alucinacion elevado por el tamano reducido (1.400 M) y por el posible dano colateral del proceso de desaprendizaje.
- El modelo solo declara soporte de ingles; no se garantiza calidad en castellano ni en otros idiomas.
- La licencia apache-2.0 permite uso comercial, pero el modelo base `locuslab/tofu_ft_phi-1.5` y `microsoft/phi-1_5` tienen sus propias condiciones que conviene verificar antes de redistribuir.
- El tag `custom_code` obliga a ejecutar codigo remoto (`trust_remote_code=True`), lo que introduce un riesgo de seguridad si no se audita el repositorio.
- La longitud de contexto no se especifica en la informacion disponible; no debe asumirse la de Phi-1.5 sin verificacion.
- No hay cuantizaciones oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos de bajo consumo sin trabajo adicional.
- El proceso de olvido no garantiza la eliminacion completa de la informacion: los metodos de unlearning pueden ser reversibles o dejar filtraciones, y deben validarse con pruebas de extraccion.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch08
- Modelo base del ajuste: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
- Repositorio TOFU (paper y codigo): https://github.com/locuslab/tofu
