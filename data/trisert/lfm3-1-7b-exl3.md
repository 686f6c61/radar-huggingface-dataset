# Trisert/LFM3-1.7B-exl3

## Resumen

LFM3-1.7B-exl3 es una coleccion de cuantizaciones EXL3 del modelo LiquidAI/LFM3-1.7B, publicada por el usuario Trisert. No se trata de un modelo nuevo, sino de una redistribucion optimizada para inferencia con ExLlamaV3 y TabbyAPI del checkpoint original de Liquid AI, una empresa especializada en modelos eficientes para dispositivos edge. El repositorio organiza las cuantizaciones en ramas independientes, una por tasa de bits, manteniendo la rama `main` unicamente con la model card y la licencia.

El modelo base es un transformer de 1.700 millones de parametros con soporte para 16 idiomas (entre ellos espanol, ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, vietnamita, tailandes, indonesio, hindi, ruso y polaco). La propuesta de esta publicacion es ofrecer variantes de 8.0, 4.0 y 2.0 bits por peso (bpw) que permitan ejecutar el modelo en GPUs de consumo con perdidas de calidad medibles y acotadas.

La relevancia practica esta en la variante `4.0bpw-sc`, generada con un pipeline de optimizacion por tensor que redistribuye bits segun la sensibilidad de cada capa, con una receta calibrada sobre trazas de chat y tool calling. Segun las mediciones del autor, esta variante reduce la divergencia KL un 33 % respecto a la cuantizacion uniforme de 4.0 bpw en texto de chat, aunque empeora en codigo y Wikipedia. El modelo ocupa entre 1,09 GB y 2,19 GB segun la revision, lo que lo hace desplegable en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LiquidAI/LFM3-1.7B); cuantizacion EXL3 con codebook `mul1` |
| Parametros totales | 1.700 millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 8.0 bpw, 4.0 bpw, 4.0 bpw-sc y 2.0 bpw; cabeza a 6 bpw (`-hq`) salvo indicacion |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | LFM Open License v1.0 (`lfm1.0`) |
| Formato de pesos | EXL3 (compatible con ExLlamaV3 y TabbyAPI); requiere `trust_remote_code` fuera de ExLlamaV3 |

## Arquitectura y entrenamiento

El modelo base LiquidAI/LFM3-1.7B es un transformer de 1.700 millones de parametros desarrollado por Liquid AI. La informacion disponible no detalla la composicion del dataset de entrenamiento, el numero de tokens ni si se aplicaron tecnicas de RLHF o DPO. El autor de la cuantizacion no aporta datos adicionales sobre el entrenamiento original.

La innovacion tecnica de esta publicacion reside en el proceso de cuantizacion, no en el modelo. Todas las revisiones usan el formato estandar EXL3 con codebook `mul1` y 250 filas de calibracion de 2048 tokens. La revision `4.0bpw-sc` se genero con el pipeline de optimizacion descrito en `doc/optimize.md` de ExLlamaV3: se parte de una traza de calibracion auto-muestreada del propio modelo (conversaciones de chat, multilingues y de tool calling), se miden ruidos por tensor y se aplica una receta que mueve bits entre tensores manteniendo el presupuesto global de 4.0 bpw. La receta resultante es mayoritariamente K=4 (89 % de los pesos), con un 5 % en K=3, un 6 % en K=5 y un unico tensor en K=2. Esta receta se incluye como `recipe_4.00bpw.yaml` en esa revision.

## Capacidades

- Generacion de texto en 16 idiomas, incluido el espanol.
- Razonamiento y conversacion multi-turno (la revision `4.0bpw-sc` esta optimizada para este tipo de texto).
- Tool calling y function calling, segun la traza de calibracion empleada (conversaciones de chat y agentes).
- Capacidad de codigo: el modelo base obtiene 46,3 % de pass@1 en HumanEval en bf16, aunque la cuantizacion afecta de forma distinta segun la revision.
- Capacidades multilingues amplias: arabe, chino, frances, aleman, italiano, japones, coreano, portugues, espanol, vietnamita, tailandes, indonesio, hindi, ruso y polaco.
- Inferencia eficiente en GPU de consumo gracias al formato EXL3 y a los kernels de ExLlamaV3.
- No se dispone de informacion sobre modo thinking, vision o audio en la documentacion proporcionada.

## Casos de uso

- Atencion al cliente automatizada: la revision `4.0bpw-sc` esta calibrada sobre conversaciones de chat y tool calling, con una KLD un 33 % inferior a la cuantizacion uniforme, lo que la hace adecuada para dialogos multi-turno en produccion sobre GPU de consumo.
- Agentes con tool calling en local: el modelo base soporta function calling y la revision optimizada mantiene mejor la fidelidad en ese dominio, por lo que puede integrarse en pipelines agenticos que corran en una unica GPU de 6 GB.
- Asistente multilingue: al cubrir 16 idiomas, puede desplegarse como asistente de soporte en espanol, portugues, frances o aleman sin cambiar de modelo.
- Prototipado rapido en equipos con hardware limitado: la revision `4.0bpw` (1,46 GB) cabe en GPUs de consumo y permite iterar sobre prompts y flujos antes de pasar a un modelo mayor.
- Generacion de codigo en entornos con restricciones de memoria: la revision `4.0bpw` mantiene 47,0 % de pass@1 en HumanEval frente al 46,3 % del bf16, por lo que es la opcion preferible si el caso de uso principal es codigo (la variante `-sc` baja al 39,0 %).
- Despliegue en servidores de inferencia con TabbyAPI: las cuantizaciones EXL3 cargan de forma nativa en ExLlamaV3 y TabbyAPI, lo que permite servir el modelo como API compatible con OpenAI en infraestructura modesta.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio publica cuatro recetas con mediciones de KLD, perplejidad y HumanEval, lo que lo convierte en un banco de pruebas util para estudiar el impacto de la cuantizacion por tensor.

## Benchmarks y rendimiento

Las mediciones las aporta el autor de la cuantizacion y comparan cada revision contra el modelo en bf16. KLD es divergencia KL (menor es mejor).

Traza held-out in-domain (aproximadamente 45.000 tokens de respuesta de chat y tool calling generados por la revision 8.0 bpw):

| Revision | KLD media | KLD mediana | Perplejidad |
|---|---:|---:|---:|
| bf16 | - | - | 1,7485 |
| 8.0 bpw | 0,00048 | 0,00020 | 1,7473 |
| 4.0 bpw | 0,02364 | 0,00903 | 1,7919 |
| 4.0 bpw-sc | 0,01595 | 0,00588 | 1,7786 |
| 2.0 bpw | 0,4186 | 0,2270 | 2,7708 |

Wikitext-2 (20 filas x 2048 tokens) y HumanEval (164 problemas, una muestra greedy):

| Revision | KLD vs bf16 | Perplejidad | HumanEval pass@1 |
|---|---:|---:|---:|
| bf16 | - | 20,65 | 46,3 % |
| 8.0 bpw | 0,00077 | 20,68 | 48,2 % |
| 4.0 bpw | 0,0658 | 21,95 | 47,0 % |
| 4.0 bpw-sc | 0,0802 | 21,79 | 39,0 % |
| 2.0 bpw | 0,860 | 45,49 | 7,3 % |

Velocidad medida con ExLlamaV3 en una RTX 2060 (6 GB), decodificacion greedy con batch 1: aproximadamente 170 tokens/s para la revision 4.0 bpw y 115 tokens/s para 8.0 bpw en contexto corto, usando un fork de ExLlamaV3 con kernels adicionales para sm_75/sm_60. Antes de esos cambios, el mismo fork media 144 tokens/s (4.0 bpw) y 101 tokens/s (8.0 bpw). No se midio ExLlamaV3 upstream.

## Requisitos de hardware

- VRAM estimada: 2,19 GB para 8.0 bpw, 1,46 GB para 4.0 bpw y 4.0 bpw-sc, 1,09 GB para 2.0 bpw. A esto hay que sumar la memoria del contexto y del runtime.
- GPU de consumo: cabe holgadamente en tarjetas de 6 GB o mas; el autor midio 170 tokens/s en una RTX 2060 de 6 GB con la revision 4.0 bpw.
- GPU profesionales: A100, H100 o RTX 4090 no son necesarias para este tamano; el modelo esta pensado para edge y consumo.
- Opciones de despliegue: ExLlamaV3 (nativo) y TabbyAPI. Fuera de ExLlamaV3 se requiere `trust_remote_code` porque el modelo base usa codigo personalizado. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: aproximadamente 170 tokens/s (4.0 bpw) y 115 tokens/s (8.0 bpw) en RTX 2060 con contexto corto, segun el fork de ExLlamaV3 empleado por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-exl3 (esta ficha) | 1,7 B | no disponible | EXL3 | LFM Open License v1.0 | Cuantizaciones de 1,09 a 2,19 GB; optimizada para ExLlamaV3 |
| LiquidAI/LFM3-1.7B | 1,7 B | no disponible | safetensors (bf16) | LFM Open License v1.0 | Modelo base original; 46,3 % en HumanEval; requiere mas VRAM |
| Otras cuantizaciones del mismo modelo base (GGUF, etc.) | 1,7 B | no disponible | GGUF y otros | depende del publicador | No disponibles en la informacion proporcionada |

No se dispone de datos de benchmarks de terceros ni de comparaciones con modelos de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- La revision `2.0bpw` no es utilizable como modelo de chat: obtiene 7,3 % en HumanEval y una perplejidad de 45,49 en Wikitext-2. El autor la publica solo como ancla K=2 del pipeline de recetas.
- La revision `4.0bpw-sc` mejora en chat y tool calling pero empeora en codigo (39,0 % vs 47,0 % en HumanEval) y en texto de Wikipedia (KLD 0,0802 vs 0,0658). No debe usarse si el caso principal es generacion de codigo.
- Las mediciones de HumanEval se basan en una unica muestra greedy por problema, lo que introduce ruido (un problema equivale a 0,6 puntos). La muestra de Wikitext-2 es de solo 20 filas.
- La traza held-out procede de la misma familia de prompts que la calibracion, por lo que el caracter "in-domain" es real pero no completamente independiente.
- Riesgo de alucinacion y sesgos: no se documentan en la informacion disponible; deben evaluarse en el modelo base LiquidAI/LFM3-1.7B.
- La licencia LFM Open License v1.0 puede imponer restricciones al uso comercial; es necesario leerla antes de desplegar en produccion.
- Fuera de ExLlamaV3 es necesario `trust_remote_code`, lo que implica ejecutar codigo del repositorio del modelo base.
- El repositorio tiene muy poca traccion (1 descarga, 0 likes en el momento de la consulta), por lo que conviene verificar la integridad de los pesos antes de usarlo en produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Trisert/LFM3-1.7B-exl3
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Rama 8.0 bpw: https://huggingface.co/Trisert/LFM3-1.7B-exl3/tree/8.0bpw
- Rama 4.0 bpw: https://huggingface.co/Trisert/LFM3-1.7B-exl3/tree/4.0bpw
- Rama 4.0 bpw-sc: https://huggingface.co/Trisert/LFM3-1.7B-exl3/tree/4.0bpw-sc
- Rama 2.0 bpw: https://huggingface.co/Trisert/LFM3-1.7B-exl3/tree/2.0bpw
- Repositorio de ExLlamaV3: https://github.com/turboderp-org/exllamav3
- Licencia LFM Open License v1.0: https://huggingface.co/Trisert/LFM3-1.7B-exl3/blob/main/LICENSE
