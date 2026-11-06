# YTan2000/Qwen3.8-27B-MLX-tqLLM

## Resumen

Qwen3.8-27B-MLX-tqLLM es un repositorio de pesos redistribuidos del modelo Qwen3.8-27B en cuantizacion de 4 bits, empaquetados en formato GGUF para su uso con tqLLM sobre Apple Silicon. Lo publica el usuario YTan2000 y deriva directamente de `mlx-community/Qwen3.8-27B-4bit`: no se reentrena ni se recuantiza, solo se cambia el contenedor para que el motor tqLLM lo lea nativamente en chips de Apple con Metal. El modelo original pertenece a la familia Qwen, desarrollada por Alibaba Qwen.

El repositorio incluye tres artefactos: el modelo en 4 bits, un drafter DFlash2 de z-lab para decodificacion especulativa y una variante con 16 indexadores QSA (atención dispersa) que permite procesar contexto largo por encima de 48K claves. Esta ultima variante esta pensada para reducir el coste computacional de la atencion en ventanas de contexto muy grandes, hasta 256K tokens segun las pruebas del autor.

Su relevancia es practica: ofrece un camino para ejecutar un modelo de 27B en 4 bits sobre Macs con memoria unificada, con cifras de decodificacion medidas en un M5 Pro de 48 GB (entre 27,5 y 62,1 tok/s segun contexto). La licencia es Apache-2.0. No obstante, el autor declara 0 descargas y 0 likes, y el pipeline no esta especificado, por lo que conviene tratarlo como un artefacto experimental de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.8-27B); pesos empaquetados en GGUF para tqLLM |
| Parametros totales | 1.924.404.480 (segun safetensors del repo; discrepante con el nombre "27B", ver limitaciones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 256K tokens en las pruebas del autor; 70K en el ejemplo de invocacion; QSA activa atencion dispersa a partir de 48K claves |
| Tipos de cuantizacion | 4 bits (MLX 4-bit); variante con indexadores QSA en FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (tres ficheros: modelo, drafter y variante QSA) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.8-27B, un transformer de la familia Qwen. Este repositorio no entrena ni afina: toma los pesos ya cuantizados a 4 bits por mlx-community y los reempaqueta en el layout GGUF que consume tqLLM en Apple Silicon, sin recuantizar. El autor afirma que los codigos son identicos a los de `mlx-community/Qwen3.8-27B-4bit`.

La innovacion tecnica del paquete es la integracion de dos componentes adicionales. Por un lado, el drafter DFlash2 de z-lab en el mismo layout, que habilita decodificacion especulativa; el autor indica que con `--exact on` cada texto generado coincide con la decodificacion plana token a token. Por otro, la variante QSA incorpora 16 indexadores de atencion dispersa (procedentes de higa2515/Qwen3.8-27B-QSA-BF16, en FP16) basados en el paper arXiv 2608.30320, que activan atencion dispersa a partir de 48K claves. El autor advierte que QSA altera el texto generado, aunque la salida especulativa sigue coincidiendo con la decodificacion plana del mismo fichero. No se dispone de datos sobre volumen de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y el pipeline asociado indican uso en dialogos multi-turno.
- Contexto largo: soporta ventanas de hasta 256K tokens en las pruebas del autor, con atencion dispersa QSA a partir de 48K claves para contener el coste.
- Decodificacion especulativa: el drafter DFlash2 acelera la generacion manteniendo equivalencia exacta con la decodificacion plana cuando se activa `--exact on`.
- Ejecucion en Apple Silicon: compatible con Metal y el motor tqLLM 1.4.1; tambien se compara con TensorFold 1.2.1 y Splash 1.4.0.
- Endpoints compatibles: el tag `endpoints_compatible` sugiere integracion con APIs de tipo OpenAI, aunque no se detalla en la model card.
- Capacidades de codigo, matematicas, vision, audio, tool calling o agentes: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en Mac: con 4 bits y memoria unificada, el modelo cabe en equipos de 48 GB y permite dialogos multi-turno sin salir del dispositivo, util para entornos con requisitos de privacidad.
- Procesamiento de documentos largos: la ventana de hasta 256K tokens y la atencion dispersa QSA permiten resumir o consultar contratos, informes o codebases extensos en una sola pasada.
- Generacion aumentada por recuperacion (RAG) con contexto amplio: al soportar decenas de miles de tokens, se pueden inyectar muchos fragmentos recuperados sin truncar, reduciendo perdida de informacion.
- Desarrollo y pruebas en Apple Silicon: investigadores que necesiten reproducir resultados con tqLLM 1.4.1 disponen de un paquete listo con drafter y variante QSA para comparar latencias.
- Evaluacion de decodificacion especulativa: el drafter DFlash2 y el modo `--exact on` permiten medir aceleraciones verificando que la salida no cambia.
- Despliegue de bajo coste en estaciones de trabajo Mac: sustituye a GPUs dedicadas en prototipos y demos internas, con throughput medido de 27,5 a 62,1 tok/s en un M5 Pro de 48 GB.
- Experimentacion con atencion dispersa: la variante QSA sirve para estudiar el impacto de la atencion dispersa en calidad y velocidad en contextos de 64K a 256K.

## Benchmarks y rendimiento

El autor publica velocidades de decodificacion (tok/s) en un M5 Pro de 48 GB, una peticion, greedy y `--exact on`:

| Contexto | 8K | 16K | 32K | 64K | 128K | 256K |
|---|---|---|---|---|---|---|
| tqLLM 1.4.1 | 51,9 | 62,1 | 56,1 | 48,8 | 38,9 | 27,5 |
| tqLLM 1.4.1, fichero QSA | denso | denso | denso | 45,7 | 49,6 | no disponible |
| TensorFold 1.2.1 | 61,0 | 54,4 | 49,9 | 41,4 | 34,7 | no cabe |
| Splash 1.4.0 | 60,8 | 62,4 | 48,4 | 43,9 | 35,9 | 24,5 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada: el repo ocupa 33,0 GB; en un Mac de 48 GB de memoria unificada el modelo en 4 bits y el drafter caben con margen para el contexto.
- GPU recomendadas: Apple Silicon con Metal; el autor mide en un M5 Pro de 48 GB. No se documentan requisitos para GPUs NVIDIA o AMD.
- GPU de consumo: no aplica en el sentido tradicional; el objetivo son chips Apple (M-series) con memoria unificada suficiente.
- Despliegue: tqLLM 1.4.1 mediante `tqserve`; se comparan TensorFold 1.2.1 y Splash 1.4.0. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 27,5 a 62,1 tok/s segun contexto en M5 Pro de 48 GB; con QSA se obtienen 45,7 tok/s a 64K y 49,6 tok/s a 128K, frente a 48,8 y 38,9 sin QSA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| YTan2000/Qwen3.8-27B-MLX-tqLLM | 1.924.404.480 (safetensors) | hasta 256K | GGUF para tqLLM | Apache-2.0 | Incluye drafter DFlash2 y variante QSA |
| mlx-community/Qwen3.8-27B-4bit | no disponible | no disponible | MLX 4-bit | no disponible | Modelo base del que deriva |
| higa2515/Qwen3.8-27B-QSA-BF16 | no disponible | no disponible | BF16 | Apache-2.0 | Origen de los 16 indexadores QSA |
| z-lab/Qwen3.8-27B-DFlash2 | no disponible | no disponible | no disponible | no disponible | Drafter de decodificacion especulativa |

No se dispone de datos de rendimiento de calidad para comparar con alternativas de la misma categoria.

## Limitaciones y advertencias

- Discrepancia de tamano: el nombre indica 27B, pero los safetensors declaran 1.924.404.480 parametros; conviene verificar antes de planificar recursos.
- Dependencia de herramienta: requiere tqLLM 1.4.1 y no funciona con otros motores de inferencia habituales.
- Plataforma limitada: disenado para Apple Silicon con Metal; sin soporte documentado para GPUs NVIDIA o AMD.
- QSA altera la salida: el autor advierte que la atencion dispersa cambia el texto generado; usar `--qsa-from off` si se requiere fidelidad al modelo denso.
- Riesgo de alucinacion: no se documentan evaluaciones de calidad ni tasas de alucinacion.
- Idiomas: no se especifican los idiomas soportados.
- Madurez: 0 descargas y 0 likes; artefacto experimental sin validacion comunitaria.
- Licencia: Apache-2.0 permite uso comercial, pero debe respetarse la licencia del modelo base y de los componentes de terceros (Qwen, mlx-community, z-lab, higa2515).
- Sin benchmarks de calidad publicados: no hay datos de MMLU, HumanEval u otros para evaluar el rendimiento real.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/YTan2000/Qwen3.8-27B-MLX-tqLLM
- Modelo base: https://huggingface.co/mlx-community/Qwen3.8-27B-4bit
- Drafter DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Indexadores QSA: https://huggingface.co/higa2515/Qwen3.8-27B-QSA-BF16
- Paper QSA: arXiv 2608.30320
- Motor tqLLM: https://tqllm.com (documentacion de Mac en docs/guides/mac.md)
