# Toxotes/GEMMA3_FINANCE_V1_GGUF

## Resumen

GEMMA3-FINANCE-V1 es un modelo de lenguaje pequeno (SLM) obtenido mediante ajuste supervisado del modelo instructivo Google Gemma 3 4B (`unsloth/gemma-3-4b-it`) sobre un corpus de 22.735 ejemplos (aproximadamente 4,87 millones de tokens) en turco especializado en finanzas, banca y regulacion. Lo publica el usuario Toxotes como parte del proyecto de tesis de master MOSAIC-v2, centrado en una arquitectura de chatbot adaptativo con RAG federado para entornos de bajos recursos.

El modelo se distribuye ya cuantizado en formato GGUF Q4_K_M con un peso de 2,32 GB, de modo que puede ejecutarse en nodos de sucursal o dispositivos edge con 2 vCPU y menos de 4 GB de RAM/VRAM. Su proposito es responder consultas de finanzas y banca en turco, incluyendo normativa oficial de BDDK y TCMB, analisis de mercado, calculo financiero y analisis de sentimiento sobre notificaciones KAP de empresas del BIST.

Su relevancia actual es acotada pero concreta: demuestra un flujo de trabajo reproducible de ajuste LoRA sobre Gemma 3 4B, cuantizacion a GGUF y despliegue con llama.cpp/llama-server en hardware muy limitado, con dominios especializados poco cubiertos por los modelos generalistas en turco. El repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3) con ajuste fino LoRA |
| Parametros totales | 59.604.992 en safetensors (corresponden al adaptador LoRA publicado); el modelo base Gemma 3 4B ronda los 4.000 millones de parametros, aunque la model card no declara una cifra exacta |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 4.096 tokens en el ejemplo de arranque con llama-server; el entrenamiento LoRA uso `max_seq_len=512`. No se declara la ventana nativa del modelo base |
| Tipos de cuantizacion | GGUF Q4_K_M (2,32 GB) |
| Idiomas soportados | turco (`tr`) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado Q4_K_M) y safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

La base es Gemma 3 4B Instruct, un transformer decoder-only de la familia Gemma 3 de Google. Sobre ella se aplico un ajuste supervisado (SFT) con LoRA de rango `r=32` y `alpha=64`, `max_seq_len=512`, learning rate `2e-4`, optimizador AdamW de 8 bits y 1.000 pasos de entrenamiento. La perdida de entrenamiento paso de 3,58 a 0,8489, lo que el autor describe como una reduccion de aproximadamente el 76 %. No se menciona en la informacion disponible ninguna fase de RLHF, DPO u otro ajuste por preferencias posterior al SFT.

El dataset es un corpus en turco de 22.735 ejemplos y unos 4,87 millones de tokens, desglosado en cinco bloques: analisis de mercado y empresas (14.743 ejemplos), notificaciones de empresas y sentimiento financiero KAP (3.478), razonamiento y calculo financiero en turco (1.791), normativa y comunicados oficiales de BDDK y TCMB (1.423) y guias de productos bancarios y creditos (1.345). El modelo resultante se exporto a GGUF Q4_K_M para despliegue en hardware de bajos recursos. No se documentan innovaciones de decodificacion, atencion lineal ni tecnicas de inferencia especulativa.

## Capacidades

- Generacion de texto en turco con registro financiero y bancario.
- Respuesta a consultas sobre productos bancarios, creditos y guias comerciales.
- Interpretacion y resumen de normativa oficial (BDDK, TCMB) y comunicados regulatorios.
- Analisis de sentimiento financiero sobre notificaciones de empresas del BIST, con una exactitud declarada del 92,50 % en el conjunto de prueba del autor.
- Razonamiento y calculo financiero basico en turco.
- Analisis de mercado y de empresas.
- Integracion como componente de respuesta rapida (FAQ y chitchat financiero) dentro de una arquitectura RAG federada, segun el diseno MOSAIC-v2.
- No se declara soporte de tool calling ni de function calling en la informacion disponible.
- No se declara capacidad de vision, audio ni modo de razonamiento explicito (thinking mode), a pesar de que el modelo base Gemma 3 4B es multimodal en su version original.
- Capacidad multilingue limitada al turco segun el campo `language` del repositorio.

## Casos de uso

- Atencion al cliente en sucursal bancaria: el modelo puede desplegarse en un equipo local con menos de 4 GB de VRAM y responder consultas frecuentes sobre productos y creditos sin salir del perimetro de la entidad, lo que reduce costes de inferencia en la nube y facilita el cumplimiento de requisitos de residencia de datos.
- Respuesta a dudas regulatorias internas: gracias al bloque de normativa de BDDK y TCMB del dataset, puede emplearse como primer nivel de consulta para empleados que necesitan localizar o resumir obligaciones y comunicados.
- Analisis de sentimiento sobre notificaciones KAP: con una exactitud declarada del 92,50 % en el conjunto de prueba del autor, sirve para clasificar el tono de comunicados de empresas cotizadas en el BIST dentro de un pipeline de monitorizacion de mercado.
- Asistente de analisis financiero para pequenos equipos: puede generar resumenes de informacion de mercado y de resultados empresariales en turco, como paso previo a la revision humana.
- Componente front-end de un sistema RAG federado: en la topologia MOSAIC-v2 se situa en nodos de sucursal (VM-1 banca minorista, VM-2 banca corporativa) para resolver consultas simples y derivar las complejas a un nodo central.
- Despliegue en dispositivos sin GPU: al estar cuantizado a Q4_K_M con 2,32 GB, puede ejecutarse por CPU en equipos con 2 vCPU y menos de 4 GB de RAM mediante llama.cpp.
- Prototipado y docencia en NLP financiero en turco: sirve como referencia reproducible de un pipeline de SFT con LoRA, evaluacion de sentimiento y cuantizacion GGUF sobre un modelo abierto.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre su propio conjunto de prueba de terminologia financiera turca y sentimiento del BIST:

| Metrica / prueba | GEMMA3-FINANCE-V1 | Criterio de exito de la tesis | Estado |
|---|---|---|---|
| Sentimiento financiero BIST (Macro F1) | 0,6284 | > 0,6000 | Cumplido |
| Exactitud en sentimiento BIST (Accuracy) | 92,50 % | > 70,0 % | Cumplido |
| Tamano del modelo (VRAM / disco) | 2,32 GB | < 4 GB de VRAM | Cumplido |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las cifras anteriores proceden de la evaluacion del propio autor y no de terceros independientes.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,32 GB de peso en disco y un consumo de VRAM del mismo orden en Q4_K_M, mas el espacio de la cache KV. El autor fija el objetivo de diseno en menos de 4 GB de VRAM.
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible. Cualquier GPU con 4 GB o mas de memoria deberia ser suficiente para la cuantizacion Q4_K_M; las cifras concretas de latencia por GPU no estan publicadas.
- Cabe en GPU de consumo: si, en principio en cualquier GPU con 4 GB o mas de VRAM. No se detallan modelos validados.
- CPU: el autor indica que el modelo esta pensado para nodos con 2 vCPU y menos de 4 GB de RAM/VRAM, por lo que la inferencia en CPU es viable.
- Opciones de despliegue: llama.cpp y llama-server, con ejemplos de arranque en la model card (`--ctx-size 4096`, `-ngl 99`). Tambien se documenta su carga como adaptador LoRA GGUF sobre un Gemma 3 4B cuantizado. No se mencionan vLLM, TGI, Ollama ni otros motores.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos comparables en la informacion proporcionada, mas alla del modelo base. La comparacion se limita, por tanto, a la relacion entre este ajuste y su base:

| Modelo | Parametros | Contexto | Licencia | Formato | Especializacion |
|---|---|---|---|---|---|
| GEMMA3-FINANCE-V1 | Adaptador LORA de 59,6 M sobre base de ~4.000 M | 4.096 tokens en el ejemplo de despliegue; entrenamiento a 512 | apache-2.0 | GGUF Q4_K_M y safetensors | Finanzas y banca en turco |
| google/gemma-3-4b-it (base) | ~4.000 M (no declarado de forma exacta en esta informacion) | no disponible en esta informacion | Terminos de uso de Gemma (la model card del ajuste declara apache-2.0) | safetensors | Proposito general, multimodal en su version original |

Otros modelos comparables de finanzas en turco: no disponible.

## Limitaciones y advertencias

- El modelo solo declara soporte de turco; no se ha validado su comportamiento en castellano ni en otros idiomas.
- El entrenamiento se realizo con `max_seq_len=512`, mientras que el ejemplo de despliegue arranca con `--ctx-size 4096`. El rendimiento mas alla de la longitud vista durante el ajuste no esta documentado y puede degradarse.
- Las cifras de evaluacion (Macro F1 0,6284 y exactitud 92,50 %) proceden del propio autor sobre su conjunto de prueba, sin validacion externa; el Macro F1 es sensiblemente inferior a la exactitud, lo que sugiere un desequilibrio de clases que conviene verificar en el caso de uso real.
- No hay datos publicos sobre sesgos, tasas de alucinacion ni comportamiento fuera de dominio.
- El riesgo de alucinacion en contenido regulatorio y financiero es relevante: el modelo puede generar referencias normativas o cifras plausibles pero incorrectas, por lo que requiere supervision humana y contraste con fuentes oficiales antes de cualquier uso con consecuencias economicas.
- La model card declara licencia apache-2.0, pero el modelo base `google/gemma-3-4b-it` esta sujeto a los terminos de uso de Gemma de Google. Conviene verificar la compatibilidad de ambos marcos antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 interacciones, sin comunidad de usuarios que haya validado el modelo en produccion.
- Existe una discrepancia entre el recuento de parametros en safetensors (59.604.992) y el tamano del repositorio (2,7 GB) frente al GGUF Q4_K_M (2,32 GB); es coherente con que los safetensors correspondan al adaptador LoRA y el GGUF al modelo fusionado, pero la model card no lo explicita.
- No se documentan soporte de tool calling, agentes, vision ni modo de razonamiento, capacidades presentes en el modelo base pero no confirmadas en este ajuste.

## Enlaces

- HuggingFace: https://huggingface.co/Toxotes/GEMMA3_FINANCE_V1_GGUF
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Modelo base utilizado para el ajuste segun la model card: `unsloth/gemma-3-4b-it`
- No se han encontrado enlaces adicionales relevantes (papers, repositorios, demos o blogs) en la busqueda web realizada; los resultados obtenidos no guardan relacion con el modelo.
