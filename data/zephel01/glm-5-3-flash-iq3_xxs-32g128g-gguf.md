# zephel01/GLM-5.3-Flash-IQ3_XXS-32G128G-GGUF

## Resumen

GLM-5.3-Flash-IQ3_XXS-32G128G-GGUF es una cuantizacion GGUF de tipo mixto del modelo Z.ai GLM-5.3-Flash (licencia MIT), publicada por el usuario zephel01. El objetivo declarado es ofrecer una version de "calidad primero" pensada para un equipo con una unica GPU de 32 GB de VRAM (RTX 5090, AI PRO R9700) y 128 GB o mas de RAM, manteniendo todos los expertos del modelo original sin poda. El archivo ocupa 127,9 GB y se distribuye en cuatro shards.

El modelo base es un MoE de 320.759.404.382 parametros totales (unos 321B), lo que lo situa en la categoria de modelos de gran escala que solo son viables en local mediante cuantizacion agresiva y offload de expertos a RAM y SSD. La cuantizacion emplea 3,13 bits por peso de media, con expertos en IQ3_XXS (89% de los bytes), IQ4_XS (8%) y Q2_K (1%), re-cuantizados mediante LDLQ a partir de los UD-Q4_K_XL de unsloth usando un volcado de Hessian sobre transcripciones de chat en la plantilla de GLM.

La relevancia actual del artefacto es que reduce el KL respecto a la referencia UD-IQ2_XXS de unsloth aproximadamente a la mitad (0,137 frente a 0,265 en 10 secuencias de 1.024 tokens), y a 0,145 frente a 0,240 en texto japones, a costa de un mayor tamano en disco y de depender de que el conjunto quepa en VRAM + RAM para no degradar la velocidad. Es una publicacion en estado BETA, con mediciones de velocidad en 128 GB aun pendientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (modelo base GLM-5.3-Flash, con capa NextN/MTP); cuantizacion GGUF mixta |
| Parametros totales | 320.759.404.382 (~321B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ3_XXS (89% de los bytes), IQ4_XS (8%), Q2_K (1%); 3,13 bits por peso de media; capas densas en Q5_K y Q4_K; router, embeddings, output y NextN en bytes de UD-IQ2_XXS |
| Idiomas soportados | no disponible en la ficha del repo; el set de calibracion y evaluacion incluye ingles, codigo y japones |
| Licencia | MIT |
| Formato de pesos | GGUF (4 shards, 127,9 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) de Z.ai con unos 321B parametros totales, e incluye una capa NextN (multi-token prediction, MTP) cuya proyeccion se conserva en la cuantizacion. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las fases de RLHF o DPO del modelo original en la informacion proporcionada.

La innovacion tecnica de esta publicacion esta en el proceso de cuantizacion: los expertos enrutados de las capas 3 a 44 se re-cuantizaron con LDLQ partiendo de los UD-Q4_K_XL de unsloth, usando un volcado de Hessian generado con transcripciones de chat en la plantilla de GLM (ingles, codigo y japones) junto con la imatrix de unsloth. Las capas densas emplean Q5_K (attention output, attention q_b, down del experto denso/compartido) y Q4_K (resto de proyecciones de atencion, gate/up del experto denso y proyeccion NextN). El router, los embeddings, la salida y el resto de la capa NextN conservan los bytes de la UD-IQ2_XXS de unsloth. La herramienta de cuantizacion es trench-gguf.

## Capacidades

- Generacion de texto conversacional en formato chat, con plantilla propia de GLM.
- Razonamiento de varios pasos y tareas de codificacion, segun los casos de uso declarados por el autor (razonamiento largo, codigo dificil).
- Procesamiento de contexto largo: se han realizado pruebas con prompts de 4K y 16K tokens y un test de aguja en 8K (resultados en curso).
- Capacidades multilingues: el set de evaluacion incluye ingles y japones, con mediciones de KL especificas para japones; el resto de idiomas no esta documentado.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-step: no documentado explicitamente; el modo de razonamiento largo se menciona como caso de uso.
- Capacidades de vision o audio: no disponible.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Razonamiento largo en local: el modelo esta pensado para trabajo "cuidadoso" donde prima la calidad sobre la velocidad, como cadenas de razonamiento extensas, gracias a que conserva todos los expertos y reduce el KL a la mitad respecto a la referencia IQ2.
- Generacion de codigo asistida en estacion de trabajo: el autor lo recomienda para codigo dificil y el set de calibracion incluye codigo, por lo que es adecuado para autocompletado y generacion en un equipo con RTX 5090 y 128 GB de RAM.
- Procesamiento de texto en japones: las mediciones de KL en japones (0,145 frente a 0,240) lo hacen util para tareas de generacion y analisis en ese idioma con calidad superior a las cuantizaciones IQ2 habituales.
- Laboratorio de evaluacion de cuantizaciones: sirve como referencia de cuantizacion de alta fidelidad para comparar tecnicas (LDLQ, imatrix, mezcla de tipos) en modelos MoE de gran escala.
- Despliegue con offload en hardware de consumo: con 32 GB de VRAM y 128 GB de RAM el archivo cabe completo y se estiman 40-45 tok/s, lo que permite uso interactivo de un modelo de 321B en una sola maquina.
- Analisis de documentos largos: con prompts de 16K tokens medidos a 21,1 tok/s en el equipo de 96 GB, es viable para resumir y extraer informacion de documentos extensos, siempre que el contexto del modelo base lo permita.
- Prototipado de asistentes conversacionales: al estar en formato GGUF y ser compatible con endpoints, puede integrarse en entornos de inferencia local para pruebas de conversacion multi-turno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los datos publicados son metricas de fidelidad de cuantizacion (KL) y de velocidad:

| Metrica | Q120d (este repo) | S1 (32G96G) | unsloth UD-IQ2_XXS |
|---|---|---|---|
| Tamano de descarga | 127,9 GB | 94,1 GB | 101,8 GB |
| KL (10 secuencias) | 0,1367 | 0,2706 | 0,2651 |
| KL en japones | 0,145 | 0,280 | 0,240 |
| Mismo token top | 84,9% | 79,1% | 79,0% |
| RTX 5090 + 96 GB RAM, prompt 4K | 23,2 tok/s (limitado por SSD) | 75,7 tok/s | 53,3 tok/s |
| RTX 5090 + 128 GB RAM | ~40-45 tok/s (estimacion) | igual o mas rapido | no disponible |

Mediciones de velocidad con Abyss v1.3.117: RTX 5090 (32 GB) sobre OCuLink PCIe Gen4 x4, Ryzen AI Max+ 395 (LPDDR5X), 96 GB de RAM (nivel de RAM 60 GB), SSD NVMe; temperatura 0, 512 tokens, cache de pagina vaciada antes de cada ejecucion, mediana de 3. Con prompt de 4K: 23,2 tok/s; con 16K: 21,1 tok/s; 17 ms por token esperando al SSD.

## Requisitos de hardware

- VRAM: 32 GB de GPU como objetivo de diseno; el archivo completo (127,9 GB) requiere ademas 128 GB de RAM para caber sin lecturas de SSD.
- GPU recomendadas: RTX 5090 (32 GB), AI PRO R9700 (32 GB); tambien se menciona RTX PRO 6000 como hardware de prueba deseado. Con 24 GB de GPU y 128 GB de RAM el autor estima que solo se leería una pequena parte del SSD.
- Cabe en GPU de consumo: si, en RTX 5090 de 32 GB, pero solo con 128 GB de RAM para evitar cuello de botella de SSD; con 96 GB de RAM, 33 GB quedan en SSD y la velocidad cae a 23 tok/s.
- Opciones de despliegue: motor Abyss (usado para las mediciones); la carga en llama.cpp esta en progreso y no confirmada. Compatible con endpoints.
- Latencia y throughput: 23,2 tok/s con prompt 4K y 21,1 tok/s con 16K en el equipo de 96 GB RAM; 40-45 tok/s estimados con 128 GB RAM (no medidos). Alternativa mas rapida: S1 (94,1 GB) a 75,7 tok/s en el mismo equipo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | KL (10 seqs) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash IQ3_XXS 32G128G (este) | ~321B (MoE) | no disponible | 0,1367 | MIT | Hugging Face, 338 descargas |
| GLM-5.3-Flash IQ2_XS 32G96G (S1, mismo autor) | ~321B (MoE) | no disponible | 0,2706 | MIT | Hugging Face |
| GLM-5.3-Flash UD-IQ2_XXS (unsloth) | ~321B (MoE) | no disponible | 0,2651 | MIT | Hugging Face |

La comparativa se limita a cuantizaciones del mismo modelo base, ya que no se dispone de datos de benchmarks frente a otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Estado BETA: el autor indica que el archivo puede sustituirse por una compilacion mejor tras nuevas mediciones, y que las comprobaciones de uso real y la carga en llama.cpp estan en curso.
- La velocidad en equipos con 128 GB de RAM es una estimacion, no una medicion; el rendimiento depende criticamente de que el archivo quepa en VRAM + RAM.
- Con menos de 128 GB de RAM, parte del archivo se lee de SSD en cada token, con una penalizacion severa (17 ms de los 43 ms por token en el equipo de prueba de 96 GB).
- No hay datos publicados de benchmarks estandar (MMLU, HumanEval, GSM8K) ni de evaluaciones de sesgo o alucinacion.
- La cobertura linguistica documentada se limita a ingles, codigo y japones en el set de evaluacion; el rendimiento en otros idiomas no esta medido.
- La cuantizacion a 3,13 bits por peso introduce perdida de fidelidad respecto al modelo original, aunque el KL sea aproximadamente la mitad que en la referencia IQ2.
- Licencia MIT heredada del modelo base, sin restricciones adicionales conocidas para uso comercial; conviene verificar los terminos del modelo base zai-org/GLM-5.3-Flash.
- El autor solicita pruebas de terceros en configuraciones de 32 GB o 24 GB de GPU con 128 GB de RAM y en RTX PRO 6000 para validar las estimaciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zephel01/GLM-5.3-Flash-IQ3_XXS-32G128G-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- GGUFs e imatrix de origen (unsloth): https://huggingface.co/unsloth/GLM-5.3-Flash-GGUF
- Variante S1 (32G96G): https://huggingface.co/zephel01/GLM-5.3-Flash-IQ2_XS-32G96G-GGUF
- Repositorio 32G128G alternativo: https://huggingface.co/zephel01/GLM-5.3-Flash-32G128G-GGUF
- Repositorio 32G96G alternativo: https://huggingface.co/zephel01/GLM-5.3-Flash-32G96G-GGUF
- Motor Abyss: https://github.com/zephel01/Abyss
- Herramienta de cuantizacion trench-gguf: https://github.com/zephel01/trench-gguf
- Formulario de envio de benchmarks: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+GLM-5.3-Flash+32G128G+Q120d+on+YOUR_GPU
