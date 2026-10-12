# yadavkapil7155/Aether

## Resumen

Aether es un modelo de lenguaje de pequeno tamano entrenado desde cero por el usuario yadavkapil7155 (Kapil) y publicado en Hugging Face bajo licencia MIT. Se trata de un transformer decoder-only de aproximadamente 100-125 millones de parametros disenado explicitamente como artefacto educativo y de investigacion, no como asistente listo para produccion. Su objetivo declarado es servir para estudiar de principio a fin el proceso de desarrollo de un modelo de lenguaje: arquitectura, tokenizacion, preentrenamiento, ajuste supervisado (SFT), fusion de checkpoints y evaluacion.

La arquitectura incorpora varias decisiones modernas pese a su tamano reducido: atencion de consultas agrupadas (GQA) con 12 cabezas de consulta y 4 de clave/valor, embeddings posicionales rotatorios (RoPE), normalizacion RMSNorm y capas feed-forward SwiGLU con embeddings de entrada y salida atados. El modelo usa un tokenizador SentencePiece con un vocabulario de 32.000 tokens y una longitud de contexto configurada de 2.048 tokens.

El preentrenamiento proceso unos 1.800 millones de tokens en aproximadamente 11,3 horas, con una perdida de validacion minima registrada de 4,3108. Sus resultados de evaluacion son muy bajos (HellaSwag 26,59% y ARC-Easy 39,18%), coherentes con un modelo de este tamano y presupuesto. La relevancia de Aether es, por tanto, didactica y reproducible, no competitiva frente a modelos de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA, RoPE, RMSNorm y SwiGLU |
| Parametros totales | 124.668.672 (segun safetensors); la model card indica 100.092.672 (~100M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas) |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors (implementacion custom, no garantiza carga via AutoModelForCausalLM) |

## Arquitectura y entrenamiento

Aether es un transformer decoder-only de 12 capas con dimension oculta de 768, 12 cabezas de consulta y 4 cabezas de clave/valor (GQA) con dimension de cabeza de 64. Emplea embeddings posicionales rotatorios (RoPE), normalizacion RMSNorm, capas feed-forward SwiGLU con dimension intermedia de 2.048 y embeddings de entrada/salida atados. El tokenizador es SentencePiece con 32.000 tokens. El objetivo de entrenamiento es la prediccion autoregresiva del siguiente token. La implementacion es propia, por lo que no se garantiza que cargue directamente con las clases estandar de `transformers`.

El preentrenamiento proceso 1.800.011.776 tokens en unas 11,31 horas, con un throughput medio de aproximadamente 20.379 tokens por segundo y un mejor checkpoint en el paso 13.600 (1.782.579.200 tokens procesados), con perdida de validacion de 4,3108. Sobre esa base se realizaron experimentos de ajuste: SFT1 con 20.000 ejemplos de un subconjunto de UltraChat 200K usando LoRA (rango 16, alpha 32, dropout 0,05, sobre proyecciones de atencion query, key, value y output); SFT2 con 4.844 ejemplos de dominio mixto (instrucciones generales, Python, SQL, preguntas tecnicas y formato); SFT3 con 12.000 ejemplos de codigo, instrucciones generales, matematicas y formato; y un experimento de supervision explicita de EOS a partir de SFT1. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generacion de texto autoregresiva basica en ingles (los idiomas soportados no estan declarados).
- Razonamiento limitado y generacion de codigo muy basica, con problemas documentados de repeticion, codigo incompleto y pasajes incoherentes.
- Ajuste por instrucciones mediante los checkpoints SFT1, SFT2 y SFT3, entrenados sobre subconjuntos de UltraChat 200K y datos mixtos.
- Supervision explicita de fin de secuencia (EOS) en el checkpoint SFT1 + EOS, que mejora ligeramente loss, perplejidad y precision de token frente al resto.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues: no disponibles (no se declaran idiomas soportados).

## Casos de uso

- Docencia de arquitecturas transformer: sirve para ilustrar con codigo propio como se combinan GQA, RoPE, RMSNorm y SwiGLU en un modelo decoder-only funcional y de tamano manejable.
- Reproduccion de un pipeline completo de entrenamiento: permite practicar tokenizacion, preentrenamiento, SFT con LoRA, fusion de checkpoints y evaluacion en un solo proyecto.
- Experimentacion con ajuste fino LoRA: el proyecto usa rango 16, alpha 32 y dropout 0,05 sobre proyecciones de atencion, lo que sirve de plantilla para estudiar configuraciones alternativas.
- Investigacion sobre supervision de EOS y repeticion: el checkpoint SFT1 + EOS esta pensado para analizar si el entrenamiento con EOS mitiga la repeticion en la generacion.
- Comparativas de presupuesto de computo: con 1,8 mil millones de tokens en 11,31 horas a ~20.379 tokens/s, es un caso util para estimar costes de entrenamiento a pequena escala.
- Pruebas de integracion de implementaciones custom: al no cargarse necesariamente via `AutoModelForCausalLM`, es util para validar compatibilidad de claves de tensor y codigo de arquitectura propio.
- Prototipado educativo de generacion de codigo en Python: aunque los resultados son pobres, puede emplearse en ejercicios controlados para mostrar los limites de un modelo de ~100M parametros.

## Benchmarks y rendimiento

Resultados de benchmarks publicados en la model card (modelo base):

| Benchmark | Resultado |
|---|---:|
| HellaSwag | 26,59% |
| ARC-Easy | 39,18% |

Evaluacion sobre un conjunto retenido de 500 ejemplos de UltraChat (442.453 tokens de asistente supervisados):

| Checkpoint | Token loss (menor mejor) | Perplejidad (menor mejor) | Precision de token (mayor mejor) |
|---|---:|---:|---:|
| Modelo base | 6,8429 | 937,16 | 2,29% |
| SFT1 | 2,9120 | 18,39 | 44,41% |
| SFT2 | 2,9253 | 18,64 | 44,19% |
| SFT3 | 2,9664 | 19,42 | 43,69% |
| SFT1 + supervision EOS | 2,8229 | 16,83 | 45,64% |

No se han publicado otros resultados de benchmarks (MMLU, GSM8K, HumanEval, etc.) en la informacion disponible. La propia model card advierte que estas metricas miden prediccion de tokens en ese conjunto concreto y no establecen calidad general como asistente.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de 124.668.672 parametros, en fp32 ocupa aproximadamente 0,5 GB, en fp16/bf16 unos 0,25 GB y en int8 unos 0,12 GB. Cabe con holgura en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU moderna con al menos 1-2 GB de VRAM es suficiente (por ejemplo, GTX 1650, RTX 3060, RTX 4090, A100, H100). El modelo no requiere hardware de gama alta.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo e incluso en CPU.
- Opciones de despliegue: no se publican pesos en GGUF, por lo que no hay integracion confirmada con llama.cpp, Ollama, vLLM ni TGI. El despliegue requiere la implementacion custom del autor y cargar `model.safetensors` en dicha arquitectura.
- Latencia y throughput estimados: el unico dato disponible es el throughput de entrenamiento (~20.379 tokens/s); no se proporcionan cifras de latencia o throughput en inferencia.

## Comparativa con modelos similares

Comparativa orientativa con alternativas de tamano equivalente. Los datos de los modelos alternativos son de conocimiento publico general y deben verificarse; los de Aether provienen de su model card.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks |
|---|---|---|---|---|---|
| Aether | 124.668.672 (safetensors) | 2.048 | MIT | Hugging Face, implementacion custom | HellaSwag 26,59%, ARC-Easy 39,18% |
| GPT-2 small | 124M (aprox.) | 1.024 | MIT modificada | Ampliamente disponible, integrado en `transformers` | no se comparan cifras aqui |
| Pythia-160M | 160M (aprox.) | 2.048 | Apache 2.0 | Hugging Face, `transformers` estandar | no se comparan cifras aqui |

No se dispone de una comparativa de rendimiento cabeza a cabeza en la informacion proporcionada; cualquier comparacion de benchmarks con estos modelos seria especulativa y no se incluye.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados explicitamente, pero al entrenarse sobre datos no especificados puede heredar sesgos de esas fuentes.
- Riesgo de alucinacion: alto. La model card indica que las respuestas pueden ser repetitivas, incoherentes, incompletas o incorrectas.
- Calidad de generacion: las pruebas con codigo Python, funciones de numeros primos y explicaciones de procesos/hilos mostraron repeticion, codigo incompleto y pasajes incoherentes; el experimento de EOS no elimino estos problemas en las pruebas cortas realizadas.
- Limitacion de contexto e idioma: contexto configurado de solo 2.048 tokens y idiomas soportados no declarados.
- Uso comercial: la licencia es MIT, lo que permitiria uso comercial, pero la propia model card desaconseja su uso en produccion, decisiones de alto riesgo, generacion de codigo critico para seguridad o tareas que exijan exactitud factual fiable.
- Caveat de integracion: usa una implementacion custom y no se garantiza que cargue con `AutoModelForCausalLM`; hay que verificar la compatibilidad entre pesos, configuracion, tokenizador e implementacion.
- Estado del proyecto: 0 descargas y 0 likes en el momento de la consulta, y la seccion de licencia y agradecimientos de la model card aparece incompleta ("aun necesita...").
- Nota de desambiguacion: los resultados de busqueda sobre "Aether Space", "Aether Labs" y "Aether AI" corresponden a otras entidades (robotica, capital riesgo) y no guardan relacion con este modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yadavkapil7155/Aether
- Archivos del modelo: https://huggingface.co/yadavkapil7155/Aether/tree/main
- Perfil del autor en Hugging Face: https://huggingface.co/yadavkapil7155/spaces
- No se han encontrado en la busqueda web papers, blogs, repositorios o demos asociados especificamente a este modelo. El resto de resultados corresponden a entidades homonimas sin relacion.
