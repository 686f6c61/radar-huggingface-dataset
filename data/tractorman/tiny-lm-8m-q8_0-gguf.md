# Tractorman/tiny-lm-8M-Q8_0-GGUF

## Resumen

tiny-lm-8M-Q8_0-GGUF es una redistribucion en formato GGUF del modelo sixf0ur/tiny-lm-8M, un modelo de lenguaje de arquitectura Llama con apenas 8,4 millones de parametros, convertido y cuantizado a Q8_0 por el usuario Tractorman para su uso con llama.cpp. El modelo original fue desarrollado por sixf0ur y esta liberado bajo licencia CC BY 4.0; esta version no modifica pesos ni tokenizador, solo cambia el contenedor y la precision numerica.

El proposito declarado de esta version es academico: forma parte de un proyecto de diseno de SoC en la asignatura ECE382M de la Universidad de Texas en Austin, donde el modelo se ejecuta sobre un acelerador FPGA especializado en productos matriz-vector en formato Q8_0. Por tanto, no es un modelo pensado para produccion ni para tareas de razonamiento complejo, sino como carga de trabajo minima y reproducible para validar hardware.

Su relevancia practica es limitada fuera de ese contexto: con 256 tokens de contexto, sin plantilla de chat y sin datos publicados de benchmarks, es util principalmente como banco de pruebas de inferencia en entornos con recursos extremadamente restringidos o para experimentacion educativa con llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (6 capas, ancho 288, 6 cabezas) |
| Parametros totales | 8.335.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | Q8_0 (unica disponible en este repo) |
| Idiomas soportados | no disponible |
| Licencia | CC BY 4.0 |
| Formato de pesos | GGUF (`tiny-lm-8M-Q8_0.gguf`, 8.960.448 bytes) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Llama clasica: 6 capas transformer, dimension de modelo 288, 6 cabezas de atencion y un vocabulario SentencePiece de 4.096 tokens. La ventana de contexto es de 256 tokens, tal y como se entreno, y no incorpora plantilla de chat, lo que implica que su uso esperado es la generacion de texto base y no la conversacion instruida.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La model card del repositorio de cuantizacion no aporta esos datos y solo documenta el proceso de conversion mediante `convert_hf_to_gguf.py` con `--outtype q8_0`. La unica innovacion tecnica reseñable es el propio contexto de uso: la cuantizacion Q8_0 esta pensada para ejecutarse sobre un acelerador FPGA que implementa productos matriz-vector de 8 bits.

## Capacidades

- Generacion de texto autoregresiva basica, limitada a secuencias de hasta 256 tokens.
- No dispone de plantilla de chat ni de formato instruct, por lo que no esta ajustado para seguir instrucciones.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no documentadas; el vocabulario de 4.096 tokens sugiere una cobertura linguistica muy limitada.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Compatibilidad con endpoints de inferencia (`endpoints_compatible` segun los tags del repo).

## Casos de uso

- Validacion de aceleradores hardware: el modelo sirve como carga de trabajo minima para verificar implementaciones de productos matriz-vector Q8_0 en FPGA, que es exactamente el escenario del proyecto ECE382M para el que se creo.
- Docencia y practicas de inferencia: permite a estudiantes ejecutar un modelo completo de punta a punta con llama.cpp en cualquier maquina, sin requisitos de GPU.
- Pruebas de integracion de llama.cpp: util para comprobar el pipeline de carga de GGUF, tokenizacion y generacion en entornos CI con recursos minimos.
- Benchmarking de latencia en dispositivos embebidos: su tamano de 8,9 MB permite medir tiempos de carga y decodificacion en placas como Raspberry Pi o microcontroladores con suficiente memoria.
- Experimentacion con tokenizadores SentencePiece pequenos: el vocabulario de 4.096 tokens facilita estudiar el comportamiento de la tokenizacion en corpus reducidos.
- Pruebas de regresion de herramientas de cuantizacion: sirve como caso de test reproducible para validar conversiones HF a GGUF y verificar hashes SHA-256.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en Q8_0 (el fichero pesa 8,9 MB, mas overhead de contexto y buffers de llama.cpp).
- GPU recomendadas: no requiere GPU; cualquier CPU moderna es suficiente.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, GTX 1650, e incluso iGPU) y en la mayoria de SBCs.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama (previa importacion del GGUF), y cualquier runtime compatible con GGUF. vLLM y TGI no estan pensados para modelos de este tamano.
- Latencia y throughput estimados: no disponibles; con 8,4 M de parametros y contexto de 256 tokens, la decodificacion en CPU deberia ser del orden de miles de tokens por segundo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| tiny-lm-8M-Q8_0-GGUF | 8,4 M | 256 | CC BY 4.0 | GGUF Q8_0 | Enfoque academico, sin chat template |
| sixf0ur/tiny-lm-8M | 8,4 M | 256 | CC BY 4.0 | safetensors (presumiblemente) | Modelo base original |
| Modelos tipo TinyStories (p. ej. roneneldan/TinyStories-1M-33M) | 1-33 M | variable | variable | safetensors / GGUF | Entrenados en corpus sintetico de cuentos; no disponibles datos comparativos directos aqui |

No se dispone de datos de rendimiento comparativo con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Capacidad linguistica muy reducida: 8,4 M de parametros y vocabulario de 4.096 tokens implican una calidad de generacion muy por debajo de cualquier modelo util para produccion.
- Contexto de solo 256 tokens, insuficiente para la mayoria de tareas reales de generacion o resumen.
- Sin plantilla de chat: no responde de forma fiable a instrucciones ni a formatos conversacionales.
- Riesgo alto de alucinacion y de texto incoherente, especialmente fuera del dominio de entrenamiento.
- Idiomas soportados no documentados; se desaconseja su uso en castellano u otros idiomas sin validacion previa.
- Licencia CC BY 4.0: permite uso comercial con atribucion, pero obliga a citar a sixf0ur como autor original y a indicar los cambios (conversion a GGUF y cuantizacion).
- No apto para produccion: cualquier despliegue real deberia usar un modelo de mayor tamano y con datos de evaluacion publicados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Tractorman/tiny-lm-8M-Q8_0-GGUF
- Modelo base: https://huggingface.co/sixf0ur/tiny-lm-8M
- Commit del modelo base referenciado: `e9b3815b72efdc9e97c17e292121b641e200d58c`
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- llama.cpp: https://github.com/ggerganov/llama.cpp
