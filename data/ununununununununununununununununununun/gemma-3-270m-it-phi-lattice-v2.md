# ununununununununununununununununununun/gemma-3-270m-it-phi-lattice-v2

## Resumen

`gemma-3-270m-it-phi-lattice-v2` es una cuantizacion del modelo `unsloth/gemma-3-270m-it` (la variante instruction-tuned de Gemma 3 con 270 millones de parametros y 18 capas) realizada por el usuario `ununununununununununununununununununun` mediante una tecnica propietaria de optimizacion post-entrenamiento denominada `phi-lattice-v2`. El objetivo declarado es reducir el error de cuantizacion a 4 y 3 bits respecto a metodos uniformes estandar, mejorando la relacion senal-ruido de pesos (SQNR) y la perplexity del modelo resultante.

El modelo base Gemma 3 esta desarrollado por Google DeepMind y distribuido bajo licencia Gemma; esta publicacion es un derivado no oficial que mantiene dicha licencia y anade pesos en formato GGUF (para Ollama y llama.cpp) junto con safetensors. El repositorio ocupa 1,7 GB e incluye una comparativa cuantitativa de cuatro variantes (BF16 de referencia, cuantizacion uniforme, phi-lattice v1 y phi-lattice v2).

Su relevancia es acotada pero concreta: demuestra que tecnicas de calibracion no uniforme pueden reducir sustancialmente la degradacion en modelos muy pequenos, donde la cuantizacion agresiva suele colapsar la calidad. No obstante, el modelo base de 270M ya es de capacidad muy limitada, y los ejemplos de generacion incluidos en la model card muestran que incluso la version BF16 comete errores factuales y aritmeticos graves.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (gemma3_text) |
| Parametros totales | 268.098.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits y 3 bits (metodo phi-lattice-v2); GGUF |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | GGUF, safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es `unsloth/gemma-3-270m-it`, un transformer decoder-only de 18 capas y aproximadamente 270 millones de parametros, afinado por instrucciones (instruction-tuned) sobre la base Gemma 3 de Google DeepMind. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO en el modelo base; esos datos no aparecen en la informacion proporcionada.

La innovacion de esta publicacion no reside en la arquitectura, sino en el proceso de cuantizacion: `phi-lattice-v2` aplica una optimizacion multidimensional post-entrenamiento junto con una pasada de calibracion de escalas ponderada por importancia. Segun la model card, esto produce una SQNR de pesos de 19,48 dB a 4 bits (frente a 18,69 dB del metodo uniforme) y una perplexity de 110,60 (frente a 352,63 del uniforme, es decir, 3,19 veces mejor), con una esparsidad del 13,48%. A 3 bits, la SQNR es de 12,63 dB y la perplexity de 1.618,3, mientras que la cuantizacion uniforme colapsa (perplexity de 1.165.167,0).

## Capacidades

- Generacion de texto conversacional en el estilo de un modelo instruction-tuned.
- Razonamiento basico y resolucion de problemas sencillos, con calidad muy limitada segun los propios ejemplos del autor.
- Aritmetica elemental y fisica basica, aunque los ejemplos de la model card muestran errores notables incluso en BF16.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; improbable dada la escala del modelo.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Compatibilidad con endpoints (`endpoints_compatible`) y despliegue via Ollama.

## Casos de uso

- Prototipado rapido de pipelines de generacion de texto: el modelo cabe en cualquier GPU consumer y permite validar integraciones (APIs, formateo de prompts, streaming) antes de escalar a modelos mayores.
- Despliegue en dispositivos con recursos muy limitados: con cuantizacion de 4 o 3 bits, el modelo puede ejecutarse en CPU o en GPUs de gama baja, util para demos offline o entornos embebidos.
- Experimentacion con tecnicas de cuantizacion: sirve como banco de pruebas para comparar phi-lattice-v2 frente a cuantizacion uniforme en un modelo pequeno y reproducible.
- Generacion de texto auxiliar de baja criticidad: borradores, resumenes cortos o clasificacion simple donde los errores no tengan consecuencias graves.
- Educacion y divulgacion: ejemplo didactico de como la calibracion de escalas afecta a la calidad de un modelo cuantizado.
- Evaluacion de robustez de cuantizacion: util para investigadores que estudien el colapso de modelos pequenos a 3 bits y el efecto de metodos no uniformes.
- No recomendado para atencion al cliente, generacion de codigo en produccion ni tareas que requieran precision factual, dado el tamano del modelo y los errores observados.

## Benchmarks y rendimiento

Los unicos datos disponibles son los de la comparativa de cuantizacion de la model card (evaluacion en ingles, sin especificar el conjunto de evaluacion completo):

| Metodo | SQNR pesos 4 bits | Perplexity 4 bits | Esparsidad 4 bits | SQNR pesos 3 bits | Perplexity 3 bits |
|---|---|---|---|---|---|
| Baseline (BF16) | Referencia | 86,22 | 0,00% | Referencia | 86,22 |
| Uniforme estandar | 18,69 dB | 352,63 | 0,00% | 11,39 dB | 1.165.167,0 (colapso) |
| phi-lattice v1 | 18,65 dB | 158,80 | 8,41% | 12,63 dB | 2.121,3 |
| phi-lattice v2 (este repo) | 19,48 dB | 110,60 | 13,48% | 12,63 dB | 1.618,3 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con cuantizacion de 4 bits; en torno a 0,5-0,7 GB con 3 bits; aproximadamente 0,6 GB en BF16 para los pesos (268M parametros a 16 bits), mas overhead de contexto.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es mas que suficiente; tambien funciona en CPU.
- Cabe holgadamente en GPU consumer, incluidas GPUs integradas y dispositivos de gama baja.
- Opciones de despliegue: Ollama (`ollama run hf.co/ununununununununununununununununununun/gemma-3-270m-it-phi-lattice-v2`), llama.cpp (formato GGUF), y potencialmente vLLM o TGI con los pesos safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera latencia muy baja en GPU y aceptable en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma-3-270m-it-phi-lattice-v2 | 268M | no disponible | gemma | GGUF, safetensors | Cuantizacion no uniforme phi-lattice-v2 |
| unsloth/gemma-3-270m-it (base) | 270M | no disponible | gemma | safetensors | Modelo original sin cuantizar |
| Gemma 3 (variantes mayores) | no disponible | no disponible | gemma | safetensors, GGUF | Familia completa de Google DeepMind; datos no detallados en la informacion disponible |

No se dispone de datos de benchmarks comparativos con otras alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo base de 270M tiene capacidad muy limitada: los ejemplos de la model card muestran errores factuales (explicacion incorrecta del congelamiento del agua) y aritmeticos (calculo erroneo de velocidad media) incluso en la version BF16.
- Riesgo elevado de alucinacion y de respuestas incoherentes, especialmente en tareas de razonamiento multi-paso.
- La cuantizacion a 3 bits degrada gravemente la calidad (perplexity de 1.618,3 frente a 86,22 en BF16); no se recomienda para uso serio.
- Sesgos conocidos: no disponibles en la informacion proporcionada; hereda los del modelo base Gemma 3.
- Limitaciones de contexto e idioma: no disponibles; la evaluacion de la model card es en ingles.
- Licencia Gemma: impone restricciones de uso comercial y obligaciones de atribucion; consultar los terminos de la licencia Gemma antes de cualquier despliegue en produccion.
- Derivado no oficial: no esta validado ni respaldado por Google DeepMind ni por Unsloth; el autor de la cuantizacion es un usuario independiente y el modelo apenas tiene descargas (11) y ningun like, lo que reduce la confianza en su validacion externa.
- La model card no documenta el conjunto de evaluacion ni la metodologia completa de calibracion, lo que dificulta reproducir los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ununununununununununununununununununun/gemma-3-270m-it-phi-lattice-v2
- Modelo base (Unsloth): https://huggingface.co/unsloth/gemma-3-270m-it
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
