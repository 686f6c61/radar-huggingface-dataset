# SubMaroon/Kitchoon-Final-26B-A4B

## Resumen

Kitchoon-Final-26B-A4B es un ajuste fino de tipo roleplay y ERP construido sobre la arquitectura Gemma 4 en configuracion Mixture of Experts, con 25.805.933.872 parametros totales y 4B activos segun el sufijo del nombre. Lo desarrolla el usuario SubMaroon y deriva de su propio modelo previo Kitchoon-V5.1-Clean-26B-A4B-EXP, al que se le ha integrado un LoRA denominado Anthropos v3 con una fuerza de 0.7. El objetivo declarado es mejorar la variedad lexica y la diversidad de respuestas en generacion de rol sin alterar el modo de razonamiento ni el formato solicitado.

La innovacion principal es la aplicacion de la tecnica BACo (arXiv 2511.05650): en lugar de ajustar el modelo para que imite una unica distribucion, se entrena un LoRA por divergencia KL hacia una mezcla a nivel de token entre el modelo ajustado (V5.1) y el modelo base preentrenado de Gemma 4. El modelo base aporta vocabulario y decisiones de composicion en un 70 por ciento de los casos, mientras que V5.1 conserva el control de la gramatica de formato, los tokens especiales y todo el canal de razonamiento. El resultado son respuestas menos repetitivas entre swipes y un uso mucho menor de muletillas y guiones largos.

Es relevante ahora porque demuestra una via practica para recuperar diversidad estilistica en modelos fuertemente alineados por instruction tuning, sin reentrenar el modelo completo y manteniendo intactos los expertos MoE, el router, los embeddings y la torre de vision. La licencia Apache 2.0 facilita su uso comercial, aunque el modelo esta disenado especificamente para roleplay en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (Gemma 4) |
| Parametros totales | 25.805.933.872 |
| Parametros activos | 4B (segun nomenclatura A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors de 51,6 GB) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 en variante MoE con 26B totales y 4B activos, e incorpora una torre de vision heredada del modelo base. Sobre Kitchoon-V5.1-Clean se aplica el LoRA Anthropos v3 (rango 32, alpha 64) en las capas 10 a 29, cubriendo las proyecciones de atencion q, k, v y o, asi como el MLP denso (gate, up y down). El LoRA se integra con fuerza 0.7 y no toca lm_head, expertos MoE, router, embeddings ni torre de vision, que permanecen identicos a V5.1.

El entrenamiento de Anthropos v3 sigue el marco BACo: en cada posicion de la respuesta el objetivo es una mezcla token a token entre V5.1 y el Gemma 4 base preentrenado. El modelo base recibe el 70 por ciento de las palabras de contenido y de las decisiones de composicion (saltos de parrafo, primera palabra de parrafo, apertura de acciones o citas, puntuacion), mientras que V5.1 decide en solitario el cierre de asteriscos y comillas, el interior de palabras, los tokens especiales, el final de la respuesta y todo el contenido entre corchetes. Cuando V5.1 es muy confiado y el base discrepa con fuerza, la cuota del base se reduce a la mitad para proteger nombres y hechos de la escena. Si la tarjeta de personaje incluye una regla de formato explicita, la composicion queda enteramente en manos de V5.1. El canal de razonamiento nunca se mezcla.

Los datos de entrenamiento usan solo contextos de datasets: aproximadamente 500 escenas de un dataset propio de roleplay con 416 tarjetas de personaje distintas, 150 escenas del dataset Kitchoon de Indexnusrefather, y un cuarto de las escenas con reglas de formato explicitas. Todas las respuestas fueron generadas por V5.1, incluyendo 150 respuestas con razonamiento y 200 escritas por la propia mezcla. El entrenamiento consistio en 1 epoca (108 pasos), learning rate 3e-5 con scheduler coseno, y pesos de perdida de 1 para la mezcla, 5 para mantener el comportamiento de V5.1 y 15 para preservar el razonamiento. La KL respecto a la mezcla en textos de validacion bajo de 1,49 a 0,62, y la KL del canal de pensamiento se mantuvo en torno a 0,03.

## Capacidades

- Generacion de texto orientada a roleplay y ERP, con foco en desarrollo de personaje y estilo de escritura neutro.
- Modo de razonamiento (thinking) que se abre y cierra de forma consistente en todas las pruebas realizadas por el autor.
- Mayor diversidad lexica entre swipes: menor solapamiento de palabras y menor repeticion de las tres primeras palabras.
- Reduccion de muletillas y guiones largos: aproximadamente 2,7 guiones largos por 1000 palabras frente a 7,2 en V5.1, y unas 5 muletillas por 1000 palabras frente a 10.
- Respeto de reglas de formato explicitas en la tarjeta de personaje (sin asteriscos, maximo de parrafos, cabecera de tiempo y lugar, prohibicion de guiones largos).
- Capacidad de vision heredada del modelo base Gemma 4 (torre de vision intacta), aunque no se documenta su uso en roleplay.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente; el canal de thinking existe pero no se describe su uso para tareas de agente.
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- Roleplay conversacional de larga duracion: el modelo mantiene coherencia de personaje en chats extensos gracias a que el canal de razonamiento se preserva intacto y el LoRA no altera los expertos ni el router; encaja en frontends tipo SillyTavern con temperatura 0.85 y Min-P 0.05.
- Generacion de ficcion interactiva con tarjetas de personaje: la capacidad de respetar reglas de formato explicitas permite imponer estilos narrativos concretos (por ejemplo, sin asteriscos o con cabecera de escena) sin que el modelo derive hacia otros formatos.
- Creacion de dialogos variados para guiones o narrativa ramificada: la menor tasa de muletillas y el menor solapamiento entre swipes reducen la sensacion de repeticion al generar multiples alternativas de una misma escena.
- Prototipado de asistentes de escritura creativa en ingles: el estilo neutro y la ausencia de sesgo hacia un genero concreto permiten adaptarlo a distintos registros mediante la tarjeta de personaje.
- Investigacion sobre diversidad estilistica en modelos alineados: el modelo sirve como referencia reproducible de la tecnica BACo aplicada mediante LoRA, con hiperparametros y metricas de KL documentados.
- Despliegue en entornos con recursos moderados: al ser un MoE de 26B con 4B activos, la inferencia activa una fraccion pequena de parametros, lo que facilita servir el modelo en GPUs de gama alta consumer o profesional con cuantizacion adecuada, aunque el repo en safetensors ocupa 51,6 GB.
- Generacion de contenido para comunidades de rol en ingles con requisitos de formato estricto: la combinacion de thinking estable y reglas de formato lo hace adecuado para pipelines automatizados de generacion de escenas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta metricas internas de estilo y de entrenamiento:

| Metrica | Kitchoon-V5.1-Clean | Kitchoon-Final |
|---|---|---|
| Guiones largos por 1000 palabras | ~7,2 | ~2,7 |
| Muletillas por 1000 palabras (tarjetas nuevas) | ~10 | ~5 |
| Solapamiento de palabras entre swipes | ~0,036 | ~0,024 |
| Swipes con las mismas tres primeras palabras | 14 % | 11 % |
| KL respecto a la mezcla (validacion) | 1,49 | 0,62 |
| KL del canal de razonamiento | no disponible | ~0,03 |

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16): en torno a 52 GB solo para pesos, mas overhead de activaciones y cache KV; requiere GPUs de 80 GB o multi-GPU.
- Cuantizacion a 8 bits: aproximadamente 26 GB de pesos, viable en una A100 40 GB o H100.
- Cuantizacion a 4 bits: aproximadamente 13 a 15 GB de pesos, viable en RTX 4090 (24 GB) y GPUs consumer de gama alta.
- GPU recomendadas: A100 80 GB o H100 para BF16; A100 40 GB o L40S para 8 bits; RTX 4090, RTX 3090 o similares para 4 bits.
- Cabe en GPU consumer: si, con cuantizacion de 4 bits en tarjetas de 16 GB o mas, aunque el contexto largo puede elevar el consumo por cache KV.
- Opciones de despliegue: llama.cpp y Ollama para cuantizaciones GGUF (no incluidas en el repo, requieren conversion), vLLM o TGI para safetensors en BF16 o FP8. El soporte de Gemma 4 MoE dependera de la version de cada runtime.
- Latencia y throughput estimados: no disponibles. Al activar solo 4B parametros por token, el throughput deberia ser superior al de un modelo denso de 26B, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kitchoon-Final-26B-A4B | 26B totales / 4B activos | no disponible | Roleplay y ERP en ingles, MoE Gemma 4 | Apache 2.0 | Hugging Face |
| Kitchoon-V5.1-Clean-26B-A4B-EXP | 26B totales / 4B activos | no disponible | Roleplay, modelo base del anterior | Apache 2.0 | Hugging Face |
| Gemma 4 base (MoE) | 26B totales / 4B activos | no disponible | Modelo generalista preentrenado | Licencia Gemma | Google / Hugging Face |

No se dispone de datos de benchmarks publicos que permitan comparar el rendimiento de Kitchoon-Final con alternativas de la misma categoria. La comparacion se limita a parametros, licencia y enfoque declarado.

## Limitaciones y advertencias

- Entrenado exclusivamente en ingles; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sera deficiente.
- Modelo sin censura (uncensored) y orientado a contenido adulto: no es adecuado para aplicaciones dirigidas a menores ni para entornos con politicas de contenido estrictas.
- Riesgo de alucinacion inherente a los modelos de lenguaje; el autor afirma que la mezcla protege nombres y hechos de la escena cuando V5.1 es confiado, pero no hay evaluacion independiente de esta proteccion.
- Las respuestas son largas (en torno a 400 palabras) y requieren configurar al menos 900 tokens de longitud de respuesta; esto puede ser un problema en aplicaciones con limites estrictos de coste o latencia.
- Sensible a la configuracion de muestreo: truncadores agresivos (Min-P alto, Top-K, XTC) eliminan buena parte de la diversidad que aporta Anthropos; se recomienda temperatura 0.85, Min-P 0.05 y penalizacion de repeticion desactivada.
- El LoRA solo modifica las capas 10 a 29 con fuerza 0.7; los cambios de estilo son moderados y el autor estima que el LoRA reproduce aproximadamente la mitad de las alteraciones de la mezcla.
- No se documentan capacidades de tool calling ni de agente, por lo que no deberia asumirse su uso en pipelines de automatizacion sin validacion previa.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado puede infringir derechos de terceros si se usa con personajes protegidos; la responsabilidad recae en el usuario.
- El repo ocupa 51,6 GB y no incluye cuantizaciones GGUF; la conversion a formatos ligeros corre a cargo del usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SubMaroon/Kitchoon-Final-26B-A4B
- Modelo base: https://huggingface.co/SubMaroon/Kitchoon-V5.1-Clean-26B-A4B-EXP
- Paper BACo: https://arxiv.org/abs/2511.05650
- Dataset Kitchoon de Indexnusrefather: https://huggingface.co/Indexnusrefather
- Donaciones del autor (Boosty): https://boosty.to/submaroon/donate
