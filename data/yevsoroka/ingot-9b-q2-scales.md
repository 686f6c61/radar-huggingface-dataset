# yevsoroka/ingot-9b-q2-scales

## Resumen

Ingot-9b-q2-scales es un ajuste fino (retune) de escalas y normas sobre dendriteholdings/Ingot-V-9B-Q2, un modelo ternario de 9B parametros derivado a su vez de Prism ML Ternary Bonsai 2 9B. Lo publica el usuario yevsoroka en Hugging Face y su proposito es corregir los tensores de escala de grupo y los tensores pequenos del contenedor ternario, manteniendo intactos los codigos ternarios originales. El entrenamiento de esos tensores se hizo contra respuestas de un profesor Qwen3.5-9B.

El modelo se distribuye unicamente como GGUF (contenedor PQ2_0 de 2.416.851.840 bytes) y no funciona con llama.cpp estandar: requiere un fork especifico de PrismML mantenido por Dendrite, en el commit `9991ae551cc08c354971ebbe739931c1f9dcfcc8`. Esto lo convierte en una pieza muy especializada, orientada a la experimentacion con cuantizacion ternaria y a la evaluacion dentro del ecosistema Ingot.

Su relevancia es acotada pero tecnica: demuestra que es posible mejorar la fidelidad de un modelo ternario ya cuantizado reentrenando solo las escalas, sin tocar los pesos ternarios, con una reduccion de KL ponderada por dominio del 4,88 % frente a Ingot-V en una muestra proxy. El autor advierte explicitamente de que el archivo no se ha enviado al validador oficial de Ingot ni ha sido puntuado por el.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5, segun tags y profesor), pesos ternarios con escalas de grupo |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la evaluacion descarta prompts de mas de 24.576 tokens) |
| Tipos de cuantizacion | Contenedor ternario PQ2_0 (unico archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (`candidate-v-s40.gguf`, 2.416.851.840 bytes) |

## Arquitectura y entrenamiento

El modelo parte de Ingot-V-9B-Q2, que es Prism ML Ternary Bonsai 2 9B con un retune previo de otro autor. La innovacion del archivo es que solo se reentrenan las escalas de grupo y los tensores pequenos; los codigos ternarios permanecen sin cambios. El entrenamiento de esas escalas se hizo contra respuestas generadas por un profesor Qwen3.5-9B, lo que sugiere una destilacion sobre los parametros de normalizacion y escala en lugar de un ajuste completo de pesos.

La evaluacion reportada se hizo el 26 de noviembre de 2026 sobre una muestra nueva del profesor: 625 de 800 muestras con forma de evaluacion, descartando prompts de mas de 24.576 tokens y truncando respuestas a 4.096 tokens. La metrica usada es el KL del bucle de entrenamiento, no el scorer de llama.cpp del validador de Ingot.

## Capacidades

- Generacion de texto conversacional (tag `conversational` en el repo).
- Razonamiento y respuesta a instrucciones heredados del modelo base Qwen3.5-9B, aunque no se documentan capacidades especificas.
- Ejecucion en llama.cpp mediante el fork de Dendrite (no compatible con llama.cpp estandar).
- Compatibilidad declarada con endpoints (`endpoints_compatible`).
- No se documentan tool calling, agentes, vision, audio ni modo thinking en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion en cuantizacion ternaria: sirve para estudiar como afecta el reentrenamiento de escalas y normas a la fidelidad de un modelo ternario ya cuantizado, comparando KL frente al modelo base.
- Evaluacion comparativa de contenedores PQ2_0: util para medir el impacto del contenedor y del fork de llama.cpp en la calidad de salida frente a otras variantes de Ingot.
- Reproduccion de experimentos de destilacion sobre escalas: el par (Ingot-V, este archivo) permite aislar el efecto de entrenar solo los tensores pequenos contra un profesor Qwen3.5-9B.
- Pruebas de integracion con el fork de PrismML/Dendrite: valido para verificar pipelines de despliegue que requieren ese runtime concreto.
- Generacion de texto local en entornos con restricciones de memoria: al ocupar 2,4 GB en disco y usar pesos ternarios, es adecuado para experimentar en hardware modesto, siempre que se disponga del fork.
- Base para futuros retunes: el autor indica que el archivo no se ha enviado al validador de Ingot, por lo que puede servir como punto de partida para candidatos que si se sometan a evaluacion oficial.

## Benchmarks y rendimiento

| Metrica | Ingot-V | Este archivo | Variacion |
|---|---:|---:|---:|
| KL media por token | 0,07712 | 0,07498 | -2,78 % |
| KL ponderada por dominio | 0,12272 | 0,11673 | -4,88 % |

Datos medidos el 26 de noviembre de 2026 sobre 625 de 800 muestras con forma de evaluacion (prompts mayores de 24.576 tokens descartados, respuestas truncadas a 4.096 tokens), usando el KL del bucle de entrenamiento. El autor senala que el KL publicado por el validador de Ingot para Ingot-V era 0,07439 y que el umbral del 4 % (crown bar) era 0,07141, pero advierte que el KL absoluto del proxy no coincide con el publicado y que esto no implica que el archivo alcanzaria ese umbral. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,4 GB solo para los pesos en el contenedor PQ2_0; el consumo real depende del runtime y del contexto, y no se documenta.
- GPU recomendadas: no disponibles; al ser un GGUF ternario con fork especifico, la compatibilidad depende del fork de PrismML/Dendrite.
- Cabe en GPU de consumo: previsiblemente si por tamano de pesos, pero no se confirma en la informacion disponible.
- Opciones de despliegue: exclusivamente el fork de PrismML/Dendrite de llama.cpp en el commit `9991ae551cc08c354971ebbe739931c1f9dcfcc8`. llama.cpp estandar no lo ejecuta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---:|---|---|---|---|
| Ingot-9b-q2-scales (este) | 8,95B | no disponible | GGUF PQ2_0 | no disponible | Retune de escalas; requiere fork |
| dendriteholdings/Ingot-V-9B-Q2 | 9B (aprox.) | no disponible | GGUF | no disponible | Modelo base; KL proxy 0,07712 / 0,12272 |
| Prism ML Ternary Bonsai 2 9B | 9B (aprox.) | no disponible | ternario | no disponible | Origen de Ingot-V |
| Qwen3.5-9B (profesor) | 9B (aprox.) | no disponible | no disponible | no disponible | Usado como profesor para las escalas |

No se dispone de datos suficientes para comparar rendimiento en benchmarks estandar con alternativas de la misma categoria.

## Limitaciones y advertencias

- No funciona con llama.cpp estandar: requiere el fork de PrismML/Dendrite en un commit concreto, lo que limita portabilidad y mantenimiento.
- El archivo no se ha enviado al validador oficial de Ingot ni ha sido puntuado por el; las metricas reportadas son un proxy interno y no equivalen a las del validador.
- El autor advierte que la mejora de KL no implica que el modelo alcanzaria el umbral del 4 % (crown bar) del validador.
- Licencia no disponible: no se puede confirmar el uso comercial.
- Idiomas soportados no documentados.
- Longitud de contexto no documentada; la evaluacion descarta prompts de mas de 24.576 tokens.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; sin validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/yevsoroka/ingot-9b-q2-scales
- Modelo base: https://huggingface.co/dendriteholdings/Ingot-V-9B-Q2
- Fork de llama.cpp requerido: PrismML/Dendrite, commit `9991ae551cc08c354971ebbe739931c1f9dcfcc8` (sin URL directa en la informacion disponible)
