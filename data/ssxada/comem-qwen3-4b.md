# ssxada/CoMem-Qwen3-4B

## Resumen

CoMem-Qwen3-4B es un conjunto de checkpoints publicado por el usuario ssxada que contiene los adaptadores CoMem y las capas de embedding y salida del decodificador necesarias para un tokenizador expandido, construidos sobre el modelo base Qwen/Qwen3-4B-Instruct-2507. No se trata de un modelo completo: el repositorio no incluye los pesos del modelo base Qwen3-4B, por lo que su uso requiere descargar dicho modelo por separado y cargar los adaptadores mediante la implementación de referencia del proyecto CoMem.

El interés del artefacto reside en la técnica CoMem, orientada a la compresión de contexto mediante un encoder y un decodificador con adaptadores entrenados a una tasa de compresión de 32. El repositorio ofrece dos etapas de entrenamiento: la etapa 1 entrena adaptadores de encoder y decodificador, mientras que la etapa 2 congela el adaptador del encoder y entrena únicamente el adaptador del decodificador. Esta aproximación resulta relevante para investigadores que trabajan en reducción de la longitud efectiva de contexto y en arquitecturas de memoria comprimida sobre modelos Instruct de 4B parámetros.

El modelo hereda la arquitectura y el tamaño del Qwen3-4B-Instruct-2507 subyacente, pero la información publicada no detalla parámetros totales, longitud de contexto efectiva tras la compresión ni idiomas soportados. La licencia es personalizada (comem-mixed-source-terms) y remite a los términos del repositorio CoMem y a las condiciones propias del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores CoMem (encoder y decodificador) sobre Qwen3-4B-Instruct-2507; arquitectura del modelo base no detallada en la informacion disponible |
| Parametros totales | No disponible (los checkpoints solo incluyen adaptadores y capas de embedding/salida del decodificador, no los pesos del modelo base) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | comem-mixed-source-terms (other), con terminos del repositorio CoMem y del modelo base |
| Formato de pesos | PyTorch: `adapters.pth`, `decoder_first_last_layers.pth`, `config.json` y ficheros de tokenizador |

## Arquitectura y entrenamiento

CoMem se articula como un esquema de compresion de contexto con dos componentes adaptadores: un encoder y un decodificador, ambos entrenados sobre el modelo base Qwen3-4B-Instruct-2507. Los checkpoints publicados operan a una tasa de compresion de 32 (`cr32`) y se organizan en dos etapas. En la etapa 1 (`stage1`) se entrenan conjuntamente el adaptador del encoder y el del decodificador. En la etapa 2 (`stage2`) el adaptador del encoder se congela y se entrena exclusivamente el adaptador del decodificador, lo que sugiere un ajuste posterior orientado a la reconstruccion o generacion a partir de representaciones comprimidas.

El repositorio incluye ademas las capas de embedding y de salida del decodificador necesarias para un tokenizador expandido, lo que implica que el vocabulario del modelo base se ha ampliado y que esas capas deben sustituirse al cargar el modelo. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. El codigo de implementacion incorpora porciones derivadas del codigo de investigacion de Apple (ml-clara), cuyos avisos de copyright se mantienen en los ficheros afectados.

## Capacidades

- Generacion de texto y razonamiento heredados del modelo base Qwen3-4B-Instruct-2507, si bien las capacidades efectivas tras la compresion de contexto no estan documentadas en la informacion disponible.
- Compresion de contexto mediante adaptadores encoder/decoder a tasa 32, orientada a reducir la longitud de las representaciones intermedias.
- Soporte de un tokenizador expandido, con capas de embedding y salida del decodificador especificas incluidas en los checkpoints.
- Carga en modo inferencia pura mediante `CoMem.from_pretrained(..., pure_inference=True)`.
- Soporte de tool calling, function calling, agentes, vision, audio o modo thinking: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en compresion de contexto: el modelo permite experimentar con representaciones comprimidas a tasa 32 sobre un modelo Instruct de 4B, comparando la calidad de generacion frente al modelo base sin compresion.
- Reproduccion de experimentos CoMem: los checkpoints de `stage1` y `stage2` permiten reproducir el pipeline de entrenamiento por etapas descrito por los autores y evaluar el efecto de congelar el encoder en la etapa 2.
- Evaluacion de tokenizadores expandidos: al incluir las capas de embedding y salida adaptadas, sirve para estudiar el impacto de ampliar el vocabulario en modelos Instruct de 4B.
- Prototipado de sistemas de memoria comprimida: util para integrar un mecanismo de memoria de contexto reducido en pipelines de generacion sobre Qwen3-4B-Instruct-2507.
- Base para fine-tuning de adaptadores: los checkpoints pueden servir como punto de partida para entrenar adaptadores CoMem adicionales sobre dominios especificos.
- Analisis de eficiencia en inferencia: permite medir el ahorro computacional derivado de la compresion de contexto en cargas de trabajo con ventanas largas, siempre que se disponga del modelo base y de la implementacion de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; el repositorio ocupa 4,9 GB y contiene solo adaptadores y capas de embedding/salida, por lo que el consumo dominante proviene de los pesos del modelo base Qwen3-4B-Instruct-2507, que deben descargarse aparte.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; depende del modelo base y de la implementacion CoMem, no documentada en los requisitos.
- Opciones de despliegue: la unica via documentada es `openrlhf.models.modeling_comem.CoMem` con `pure_inference=True`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CoMem-Qwen3-4B (ssxada) | No disponible (adaptadores sobre Qwen3-4B) | No disponible | Compresion de contexto con adaptadores encoder/decoder | comem-mixed-source-terms | Hugging Face, requiere modelo base |
| Qwen/Qwen3-4B-Instruct-2507 | 4B (segun modelo base) | No disponible en esta ficha | Modelo Instruct completo | Terminos propios de Qwen | Hugging Face |
| Modelos CoMem de referencia (scar-on/CoMem) | No disponible | No disponible | Implementacion y codigo de referencia de CoMem | Terminos del repositorio CoMem | GitHub |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Los checkpoints no incluyen los pesos del modelo base Qwen3-4B-Instruct-2507; sin descargarlo por separado el modelo no es funcional.
- La licencia `comem-mixed-source-terms` es personalizada y remite a los terminos del repositorio CoMem y del modelo base; es necesario revisar ambas condiciones antes de cualquier uso comercial.
- El codigo incorpora porciones derivadas de Apple ml-clara, con avisos de copyright que deben mantenerse en los ficheros afectados.
- No se documentan sesgos conocidos, riesgo de alucinacion ni limitaciones de idioma en la informacion disponible.
- La longitud de contexto efectiva tras la compresion a tasa 32 no esta especificada, lo que impide garantizar el comportamiento en ventanas largas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validacion por parte de la comunidad.
- No se detallan requisitos de hardware ni opciones de despliegue estandar, lo que limita su uso en produccion sin trabajo adicional de integracion.

## Enlaces

- Hugging Face: https://huggingface.co/ssxada/CoMem-Qwen3-4B
- Repositorio CoMem: https://github.com/scar-on/CoMem
- Licencia CoMem: https://github.com/scar-on/CoMem/blob/master/LICENSE
- Acknowledgements CoMem: https://github.com/scar-on/CoMem/blob/master/ACKNOWLEDGEMENTS
- Codigo de investigacion de Apple (ml-clara): https://github.com/apple/ml-clara
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
