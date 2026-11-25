# sousekd/DeepSeek-V4.1-Flash-1017-EXL3-3bpw-HyperFlare-GB202-TP2

## Resumen

DeepSeek-V4.1-Flash-1017-EXL3-3bpw-HyperFlare-GB202-TP2 es un empaquetado comunitario del checkpoint EXL3 de 3 bits por peso (bpw) de Diffbot para el modelo DeepSeek-V4.1-Flash-1017 de DeepSeek. El paquete lo publica el usuario sousekd en Hugging Face y esta optimizado para ejecutarse en dos GPU NVIDIA RTX PRO 6000 Blackwell (arquitectura GB202) mediante tensor parallelism de grado 2 (TP2), con 96 GB de VRAM por tarjeta.

El modelo es multimodal (pipeline image-text-to-text) y esta pensado para servir cargas de trabajo de contexto largo: la model card reporta 128K tokens de contexto en las pruebas de rendimiento. La cuantizacion EXL3 a 3 bpw reduce drasticamente el peso en memoria frente a los pesos originales, permitiendo desplegar un modelo de gran tamano en hardware profesional de gama alta pero no de centro de datos.

La relevancia de este paquete es practica: incluye un runtime especifico (NVIDIA HyperFlare, con trabajo de FlashInfer/b12x de Local Inference Lab), una receta de build reproducible, verificacion de firmas de pesos y un contenedor Docker listo para ejecutar. No es un modelo entrenado desde cero, sino una distribucion de inferencia optimizada de un modelo existente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base DeepSeek-V4.1-Flash-1017; formato de pesos EXL3) |
| Parametros totales | 13.404.185 (segun safetensors; ver nota) |
| Parametros activos | no disponible |
| Longitud de contexto | 128K tokens (probado en benchmarks de rendimiento) |
| Tipos de cuantizacion | EXL3 a 3 bits por peso (3 bpw) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (EXL3), empaquetado para runtime HyperFlare |

Nota sobre parametros: el dato de safetensors (13.404.185) es el recuento reportado por el repositorio y no es coherente con el tamano del repo (337,2 GB) ni con el requisito de dos GPU de 96 GB. Se reproduce tal cual aparece en la informacion disponible; probablemente refleja solo una parte de los tensores o un conteo parcial. No se dispone de una cifra fiable de parametros totales.

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base DeepSeek-V4.1-Flash-1017 en la documentacion proporcionada (no se detalla si es transformer denso, MoE o hibrido, ni el numero de tokens de entrenamiento o si hubo RLHF/DPO). Lo que si se documenta es la capa de empaquetado y despliegue:

- Cuantizacion EXL3 a 3 bpw realizada por Diffbot, publicada en el checkpoint `diffbot/DeepSeek-V4.1-Flash-EXL3-3bpw-2x-RTX-PRO-6000`.
- Receta de tensor parallelism TP2 y guia de exportacion de AzallazA para RTX PRO 6000.
- Runtime NVIDIA HyperFlare con kernels FlashInfer/b12x de Local Inference Lab.
- Decodificacion especulativa mediante MTP (multi-token prediction) con `--mtp-draft-tokens 5`, verificacion adaptativa y presupuesto maximo de 32 tokens de verificacion.
- Gestion de tablas Engram en RAM del host (`--embedding-table-storage ram`), con recomendacion de 256 GB de RAM de sistema.
- Cache de prefijos en memoria (8 GB) y disco deshabilitado, con politica de scheduler interactivo y ordenacion TTFT por peticion mas corta.

## Capacidades

- Generacion de texto y razonamiento: el modelo base es de proposito general; la model card reporta resultados en MMLU-Pro y GSM8K.
- Razonamiento matematico: GSM8K al 96,97 % segun el autor del empaquetado.
- Entrada imagen-texto: el pipeline declarado es image-text-to-text, por lo que acepta imagenes junto con texto.
- Contexto largo: probado a 128K tokens en las mediciones de prefill y decode.
- Servicio concurrente: soporta multiples peticiones simultaneas (probado con 8 peticiones concurrentes).
- Decodificacion especulativa MTP con verificacion adaptativa para acelerar la generacion.
- Verificacion de integridad de pesos (`--verify-weights`) y firma de publisher en el runtime.
- No se documenta soporte explicito de tool calling, function calling ni flujos de agentes multi-paso en la informacion disponible.

## Casos de uso

- Analisis de documentos largos con imagenes: el modelo acepta entradas image-text-to-text y mantiene 128K tokens de contexto, lo que permite procesar informes escaneados, capturas o diagramas junto con texto extenso en una sola peticion.
- Asistencia tecnica sobre base documental: con 128K de contexto se puede inyectar un manual o base de conocimiento completo y responder preguntas de seguimiento en conversaciones multi-turno.
- Procesamiento por lotes de alta concurrencia: el runtime alcanza 582 tokens/s agregados con 8 peticiones concurrentes a 128K de contexto, adecuado para pipelines de resumen o extraccion masiva.
- Evaluacion de modelos en laboratorio: el paquete reproducible (Docker, receta TP2, verificacion de firmas) facilita reproducir resultados de MMLU-Pro y GSM8K en hardware Blackwell.
- Despliegue en infraestructura de gama alta no-datacenter: dos RTX PRO 6000 de 96 GB son una alternativa a clusters de A100/H100 para equipos con presupuesto de centro de datos limitado.
- Investigacion en cuantizacion: sirve como referencia practica de EXL3 a 3 bpw con decodificacion especulativa MTP, util para estudiar el equilibrio calidad/rendimiento en cuantizacion agresiva.
- Servicio interactivo de baja latencia: con politica de scheduler interactivo y ordenacion por TTFT se orienta a cargas conversacionales donde importa el tiempo hasta el primer token.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| MMLU-Pro | 87,50 % | Segun model card (HyperFlare) |
| GSM8K | 96,97 % | Segun model card (HyperFlare) |
| Prefill en frio (128K) | 9.649 tokens/s | 2x RTX PRO 6000, TP2, 350 W/GPU |
| Decode sostenido (128K, 1 peticion) | 195 tokens/s | 2x RTX PRO 6000, TP2, 350 W/GPU |
| Decode agregado (128K, 8 peticiones) | 582 tokens/s | 2x RTX PRO 6000, TP2, 350 W/GPU |
| Decode por peticion (128K, 8 peticiones) | ~73 tokens/s | 2x RTX PRO 6000, TP2, 350 W/GPU |
| Decode agregado (contexto cero, 8 peticiones) | 744 tokens/s | 2x RTX PRO 6000, TP2, 475 W/GPU |

Los datos de calidad y rendimiento provienen de la model card del empaquetador y de la referencia a `BENCHMARKS.md` y al informe de `lil-bench`; no se han verificado de forma independiente.

## Requisitos de hardware

- VRAM: dos GPU de 96 GB (RTX PRO 6000 Blackwell, GB202) en configuracion TP2. No cabe en una sola GPU consumer.
- RAM de sistema: 256 GB recomendados para mantener las tablas Engram en RAM del host.
- Disco: aproximadamente 314 GiB libres para la descarga; el repo ocupa 337,2 GB.
- GPU recomendadas: RTX PRO 6000 Blackwell (96 GB). No se documenta soporte para A100, H100 ni RTX 4090.
- GPU consumer: no es viable; el modelo no cabe en tarjetas de 24 GB ni 48 GB.
- Despliegue: exclusivamente mediante el runtime NVIDIA HyperFlare y la imagen Docker `ghcr.io/sousekd/hyperflare-ds41-exl3` (digest fijado). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este paquete; la model card referencia una comparacion con vLLM en `BENCHMARKS.md`.
- Consumo: limites de potencia probados a 350 W y 475 W por GPU.
- Latencia y throughput: ver tabla de benchmarks.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware |
|---|---|---|---|---|---|
| Este paquete (DeepSeek-V4.1-Flash-1017 EXL3 3bpw) | no disponible (repo 337,2 GB) | 128K | EXL3 3 bpw | MIT | 2x RTX PRO 6000 96 GB |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | no disponible | no disponible | pesos originales | no disponible | no disponible |
| diffbot/DeepSeek-V4.1-Flash-EXL3-3bpw-2x-RTX-PRO-6000 | no disponible | no disponible | EXL3 3 bpw | no disponible | 2x RTX PRO 6000 |

No se dispone de datos de benchmarks ni especificaciones de modelos alternativos de la misma categoria en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- El recuento de parametros reportado por safetensors (13.404.185) es incoherente con el tamano del repositorio y los requisitos de hardware; no debe usarse para estimar costes de despliegue.
- La cuantizacion agresiva a 3 bpw puede degradar la calidad respecto a los pesos originales; los benchmarks reportados son del empaquetador y no se han verificado de forma independiente.
- El paquete esta atado a hardware muy especifico (2x RTX PRO 6000 Blackwell, TP2) y a un runtime propietario de NVIDIA (HyperFlare); no es portable a otras configuraciones sin trabajo adicional.
- Requiere aceptar manualmente la clave de publisher `sousekd` o usar los flags `--dangerously-approve-key` y `--dangerously-accept-publisher`, lo que implica confiar en el empaquetador.
- No se documentan idiomas soportados; el rendimiento multilingue es desconocido.
- No se documenta soporte de tool calling ni de agentes; no asumir su disponibilidad en produccion.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado evaluaciones de sesgo o robustez.
- La licencia MIT se aplica al empaquetado; deben revisarse las condiciones del modelo base DeepSeek y los avisos de terceros (`NOTICE`) antes de uso comercial.
- El contexto de 128K incrementa el consumo de memoria y reduce el throughput por peticion (de 195 a ~73 tokens/s con 8 peticiones concurrentes).

## Enlaces

- Hugging Face: https://huggingface.co/sousekd/DeepSeek-V4.1-Flash-1017-EXL3-3bpw-HyperFlare-GB202-TP2
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Checkpoint EXL3 de Diffbot: https://huggingface.co/diffbot/DeepSeek-V4.1-Flash-EXL3-3bpw-2x-RTX-PRO-6000
- Receta TP2 de AzallazA: https://github.com/AzallazA/RTX-PRO-6000-TP3-Inference-Recipes/tree/main/DeepSeek-V4.1-Flash%20Hyperflare-tp2-exl3-20261117
- Runtime NVIDIA HyperFlare: https://github.com/NVIDIA/hyperflare-inference
- FlashInfer/b12x (Local Inference Lab): https://github.com/local-inference-lab/flashinfer
- Informe de rendimiento: https://docker.local-inference-lab.ai/bench/runs/V95Ig500ucFX
- Licencia: https://huggingface.co/sousekd/DeepSeek-V4.1-Flash-1017-EXL3-3bpw-HyperFlare-GB202-TP2/blob/main/LICENSE
- Avisos de terceros: https://huggingface.co/sousekd/DeepSeek-V4.1-Flash-1017-EXL3-3bpw-HyperFlare-GB202-TP2/blob/main/NOTICE
