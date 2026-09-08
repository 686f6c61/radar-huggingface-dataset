# unravler-media/GLM-5.3-CYBERSECURITY-FP8

## Resumen

GLM-5.3-CYBERSECURITY-FP8 es una modificacion de pesos (tipo "crack" o abliterated) del modelo GLM-5.3-FP8 de JANGQ-AI, que a su vez es una cuantizacion FP8 del modelo original zai-org/GLM-5.3. El trabajo lo publica unravler-media bajo el seudonimo dealignai. El objetivo de esta version es reducir los rechazos de seguridad en el dominio de ciberseguridad ofensiva, red teaming, desarrollo de exploits, ingenieria inversa, analisis de malware y pentesting, manteniendo intactas las capacidades nucleares del modelo base.

El modelo es un Transformer Mixture of Experts con arquitectura `glm_moe_dsa` (DeepSeek-sparse attention), 78 capas, solo texto y 753.329.940.480 parametros totales. Se puede desplegar con vLLM usando el parser `glm45` para razonamiento y el parser `glm47` para tool calling, con una ventana de contexto de 131.072 tokens. Es un modelo de enorme tamano, pensado para clusters de GPU Hopper, y ofrece una opcion interesante para equipos de seguridad que necesiten un modelo sin filtros de seguridad en el ambito tecnico, con una reduccion de rechazos no limitada a ciberseguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con DeepSeek-sparse attention (`glm_moe_dsa`), 78 capas |
| Parametros totales | 753.329.940.480 |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | FP8 (nativo en GPU Hopper) |
| Idiomas soportados | ingles, chino, ruso, serbio, hindi, frances, espanol, arabe, coreano, japones |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `zai-org/GLM-5.3`, un modelo de texto con arquitectura MoE y atencion dispersa de tipo DeepSeek. Sobre este base, `JANGQ-AI/GLM-5.3-FP8` aplica una cuantizacion FP8 que mantiene los pesos de los expertos en FP8 y los residuos en bf16. La modificacion de unravler-media no consiste en un fine-tuning ni en el uso de LoRA, sino en una edicion directa de los pesos de los "residual writers" en bf16 para eliminar comportamientos de rechazo. Los expertos FP8 se mantienen intactos, lo que permite conservar la velocidad nativa de FP8 en hardware Hopper.

No se especifica el dataset de entrenamiento ni si hubo procesos de RLHF o DPO en el desarrollo del crack. La eliminacion de rechazos se realiza mediante tecnicas de "abliterated" y "refusal-removed" que alteran las representaciones internas del modelo para que no genere respuestas de negacion en el dominio objetivo. Segun el autor, el modelo no es un uncensor universal: la reduccion de rechazos esta calibrada para contenido de ciberseguridad, aunque el efecto se generaliza a otros dominios de riesgo.

## Capacidades

- Generacion de texto conversacional en diez idiomas (ingles, chino, ruso, serbio, hindi, frances, espanol, arabe, coreano, japones).
- Alto cumplimiento de peticiones de ciberseguridad ofensiva: desarrollo de exploits, red team, pentesting, ingenieria inversa, evasion, phishing, analisis de malware y tecnicas de credential attack.
- Rechazos reducidos en otros dominios de riesgo como armas biologicas, quimicos, fraude financiero, explosivos y violencia generica, segun los benchmarks del autor.
- Soporte de tool calling / function calling: el modelo puede integrarse en vLLM con `--tool-call-parser glm47` y `--enable-auto-tool-choice`.
- Soporte de razonamiento tipo "thinking mode": el parser `--reasoning-parser glm45` es compatible con el modelo.
- Capacidad de procesar contexto largo de 131.072 tokens, adecuado para analisis de documentos extensos, trazas y codigo fuente.
- No reproduce de forma literal contenido con copyright: esta limitacion se mantiene de forma residual incluso en esta version.

## Casos de uso

- Red teaming interno: el modelo genera tecnicas, payloads y TTPs para pruebas de penetracion en entornos autorizados, reduciendo la necesidad de rechazos que interrumpen el flujo de trabajo.
- Desarrollo de exploits: asistencia en analisis de vulnerabilidades y escritura de pruebas de concepto, gracias a su capacidad para completar codigo y razonar sobre protocolos y binarios.
- Ingenieria inversa: apoyo para entender estructuras de ejecutables, desensamblados y trazas, aprovechando su contexto largo para analizar grandes volumenes de bytes o logs.
- Analisis de malware: descripcion de comportamientos, extraccion de indicadores de compromiso y generacion de resumenes tecnicos a partir de muestras.
- Simulacion de phishing: generacion de correos y mensajes realistas para campanas de concienciacion, con control sobre estructuras y tecnicas de persuasion.
- Automatizacion de pentesting: como back-end de agentes que planifican y ejecutan acciones ofensivas, gracias al soporte de tool calling y razonamiento multi-paso.

## Benchmarks y rendimiento

Los datos que se presentan a continuacion provienen de la model card del autor y no han sido verificados de forma independiente.

| Benchmark | Modelo base (GLM-5.3 regular) | GLM-5.3-CYBERSECURITY-FP8 | Delta |
|---|---|---|---|
| MMLU (logit-mode, 1026 preguntas) | 85,58 % | 86,65 % (889/1026) | +1,07 pp |

| HarmBench-320, compilacion no-copyright (240 comportamientos) | effort off | effort low | effort max |
|---|---|---|---|
| Cumplimiento directo | 196 (81,7 %) | 202 (84,2 %) | 192 (80,0 %) |
| Rechazo suave | 4 | 4 | 3 |
| Redireccion | 2 | 8 | 3 |
| Desvio | 1 | 0 | 0 |
| Rechazo duro | 0 | 1 | 0 |
| Desconocido | 37 | 25 | 40 |

En el desglose por tema, la categoria cyber_offense alcanza un cumplimiento directo del 89 % / 89 % / 84 % en los niveles de esfuerzo off, low y max. La categoria copyright es la principal limitacion residual, con un cumplimiento directo de solo el 16 % / 11 % / 20 %.

## Requisitos de hardware

- VRAM estimada para inferencia: el tamano del repositorio es de 755,7 GB, lo que implica aproximadamente 755 GB de pesos FP8 mas overhead. No cabe en una sola GPU ni en configuraciones de menos de 8 GPU de alta capacidad.
- GPU recomendadas: cluster de 8x H200 (o H100) con soporte FP8 nativo. La configuracion de despliegue del autor usa `--tensor-parallel-size 8`, `--gpu-memory-utilization 0.90` y `--max-model-len 131072`.
- No es apto para GPU de consumo tipo RTX 4090 ni para tarjetas con menos de 80 GB de VRAM.
- Opciones de despliegue: vLLM (stock), segun la documentacion del autor. No se mencionan alternativas como llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Diferencia principal | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zai-org/GLM-5.3 | Modelo base original, sin cuantizar ni abliterar | 753.329.940.480 (no disponible en la informacion del crack) | no disponible | no disponible | Hugging Face |
| JANGQ-AI/GLM-5.3-FP8 | Cuantizacion FP8 del base, sin modificacion de rechazos | 753.329.940.480 | no disponible | no disponible | Hugging Face |
| unravler-media/GLM-5.3-CYBERSECURITY-FP8 | Version con rechazos reducidos especificamente para ciberseguridad ofensiva | 753.329.940.480 | 131.072 tokens | MIT | Hugging Face |
| dealignai/GLM-5.3-UNCENSORED-FP8 | Sibling uncensor generalista, elimina rechazos en todos los dominios | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- No es un uncensor universal: la reproduccion literal de contenido con copyright sigue siendo rechazada en una proporcion significativa de casos.
- Los benchmarks de compliance y MMLU son datos proporcionados por el autor y no han sido reproducidos de forma independiente.
- El modelo puede generar contenido peligroso (exploits, malware, tecnicas de evasion) sin rechazos. Debe utilizarse exclusivamente en entornos autorizados y con salvaguardas legales.
- Los rechazos se reducen tambien en dominios como armas biologicas, quimicos o fraude financiero, lo que amplia el riesgo de uso indebido.
- No se han publicado evaluaciones de alucinacion ni de sesgos para esta version, por lo que su fiabilidad en tareas no tecnicas no esta caracterizada.
- El despliegue requiere un cluster de GPU muy costoso, lo que limita su accesibilidad a organizaciones con infraestructura propia.
- La licencia MIT se aplica a los pesos modificados, pero es recomendable revisar la licencia del modelo base original por si existen restricciones adicionales.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/unravler-media/GLM-5.3-CYBERSECURITY-FP8
- Modelo base original: https://huggingface.co/zai-org/GLM-5.3
- Cuantizacion FP8 usada como base: https://huggingface.co/JANGQ-AI/GLM-5.3-FP8
- Sibling uncensor generalista: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8
- Perfil del autor: https://huggingface.co/unravler-media
- Twitter del autor: https://twitter.com/dealignai
