# txgsync/K2-Horizon-MoVA-36B-A4B-MLA-oQ4e

## Resumen

K2-Horizon-MoVA-36B-A4B-MLA-oQ4e es una cuantizacion afín de 4 bits del modelo txgsync/K2-Horizon-MoVA-36B-A4B-MLA, publicado por el usuario txgsync. El modelo padre no es un entrenamiento desde cero: es una conversion de atencion del K2-Horizon-MoVA-36B-A4B original de IFM, que pasa de grouped-query attention (GQA) a multi-head latent attention (MLA) mediante la tecnica TransMLA, seguida de un proceso de destilacion de reparacion que redujo la divergencia KL de 0,154 a 0,091 respecto al original.

La relevancia practica esta en la cache KV: con MLA cada token ocupa 84 KiB en lugar de los 192 KiB de la version GQA (un latente de 768 dimensiones mas una clave RoPE de 128 dimensiones por capa), lo que a 128K tokens supone 11,3 GB de cache frente a 25,8 GB. El modelo completo pesa 22,89 GB y suma 37.783.744.212 parametros, con un regimen de mezcla de expertos (MoE) cuyo sufijo A4B sugiere del orden de 4.000 millones de parametros activos.

La ficha del autor lo declara explicitamente como research preview y como "vara de medir" (yardstick) de calidad: una cuantizacion afín convencional, calibrada con imatrix, cuya unica funcion es servir de referencia frente a las variantes SeedLM de la misma familia. No es un modelo orientado a produccion, sino una publicacion de investigacion sobre compresion y atencion eficiente, pensada exclusivamente para Apple Silicon a traves de MLX.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con multi-head latent attention (MLA, conversion TransMLA desde GQA); codigo personalizado (`k2_mla.py`, requiere `trust_remote_code`) |
| Parametros totales | 37.783.744.212 (≈37,8 B, dato real de los safetensors) |
| Parametros activos | ≈4 B (indicado por el sufijo A4B del nombre; no confirmado de forma explicita en la model card) |
| Longitud de contexto | No declarada explicitamente; la tabla de memoria de la model card cubre ventanas de hasta 200.000 tokens y la comparativa de cache KV se detalla a 128K |
| Tipos de cuantizacion | oQe afín 4 bits (nivel 4, enhanced, group size 64, calibrado con imatrix sobre el texto de calibracion interno de oMLX). En la familia existen tambien oQe 6 bits, oQe 8 bits y variantes SeedLM P3/P4 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (`library_name: mlx`), 22,89 GB de pesos dentro de un repositorio de 22,9 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) que originalmente usaba grouped-query attention y cacheaba 192 KiB por token. El modelo padre de esta version aplica TransMLA (Meng, Yao, Zhang, 2025; arXiv:2502.07864), un metodo que convierte la atencion GQA en multi-head latent attention: en lugar de almacenar todas las claves y valores por cabeza, la cache guarda un unico latente de 768 dimensiones mas una clave RoPE de 128 dimensiones por capa, lo que baja el coste a 84 KiB por token. Tras la conversion se aplico una destilacion de reparacion que redujo la divergencia KL frente al original de 0,154 a 0,091 en la ventana R-01.

Esta publicacion concreta no entrena nada nuevo: es una cuantizacion afín de 4 bits generada desde txgsync/K2-Horizon-MoVA-36B-A4B-MLA en la revision `36676776` con oMLX v0.7.1.dev1 (`c0b1056b`, funcion `quantize_oq_streaming`), nivel 4, modo enhanced y group size 64. Antes de cuantizar se eliminaron del origen las proyecciones `k_proj` y `v_proj` de la atencion GQA que `k2_mla.py` descarta al cargar. El autor reporta que la cuantizacion supera su propia regla de calidad R-2 (barra +0,030) con un margen de +0,0093 sobre el BF16 reparado en las 8 ventanas R-2. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset (mas alla de las referencias IFM/K2-Horizon-Pretrain-Data y IFM/K2-Horizon-Midtrain-Data) ni si hubo fases de RLHF o DPO en el modelo original.

## Capacidades

- Generacion de texto y conversacion multi-turno (`pipeline_tag: text-generation`, etiqueta `conversational`), en ingles.
- Razonamiento y generacion de codigo: no hay evaluacion especifica publicada en la informacion disponible, por lo que no puede confirmarse el nivel de rendimiento en estas tareas.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles; no se declara soporte de otros idiomas.
- Capacidad especial destacable: gestion de contexto largo con cache KV reducida (84 KiB por token frente a 192 KiB del modelo con GQA), lo que permite mantener conversaciones o documentos extensos con un coste de memoria mucho menor.
- No se declaran capacidades de vision, audio ni modo de pensamiento explicito.

## Casos de uso

- Investigacion en compresion de modelos: el propio autor define esta publicacion como la referencia afín ("yardstick") contra la que medir las variantes SeedLM de la misma familia. Su uso principal es servir de linea base en experimentos de cuantizacion, no de despliegue final.
- Evaluacion de tecnicas de atencion eficiente: permite comparar de forma controlada GQA frente a MLA con los mismos pesos y el mismo harness de evaluacion, midiendo divergencia KL y acuerdo top-1.
- Inferencia local en Apple Silicon: con 22,89 GB de pesos y un consumo total de 23,2 GB a 4K de contexto, cabe en un Mac con memoria unificada de 32 GB, lo que habilita ejecucion local sin GPU dedicada.
- Procesamiento de documentos largos en local: gracias a los 84 KiB por token, a 128K tokens el modelo ocupa 34,2 GB en total (11,3 GB solo de cache), frente a los 47,8 GB de la variante GQA. Es viable en equipos con 48-64 GB de memoria unificada.
- Analisis de corpus extensos por lotes: la reduccion de cache reduce el coste por peticion en escenarios de resumen o extraccion sobre entradas muy largas.
- Reproducibilidad y validacion de cuantizaciones: sirve como punto de comparacion reproducible para verificar si un nuevo esquema de cuantizacion mejora la fidelidad respecto a una cuantizacion afín bien ajustada.
- Prototipado conversacional en ingles sobre macOS: con MLX como unico backend soportado, encaja en flujos de desarrollo que ya usan el ecosistema MLX en local.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.): no disponible. Lo que si reporta es divergencia KL respecto al modelo original con GQA en BF16, medida en MLX sobre 60 ventanas retenidas (31.713 posiciones de prosa y 29.667 de chat), junto con el acuerdo top-1 en las ventanas de prosa.

| Modelo | Atencion | Pesos | KLD held-out / chat | Top-1 held-out | KV / token |
|---|---|---|---|---|---|
| NanoSeedLM-P4 (semillas SeedLM, expertos P4) | MLA | 22,20 GB | 0,1535 / 0,0780 | 83,79 % | 84 KiB |
| NanoSeedLM-P3 (semillas SeedLM, expertos P3) | MLA | 20,07 GB | 0,1623 / 0,0820 | 83,20 % | 84 KiB |
| oQ4e (este modelo), afín 4 bits | MLA | 22,89 GB | 0,1548 / 0,0789 | 83,83 % | 84 KiB |
| oQ6e, afín 6 bits | MLA | 31,74 GB | 0,1446 / 0,0745 | 84,39 % | 84 KiB |
| oQ8e, afín 8 bits | MLA | 40,61 GB | 0,1436 / 0,0739 | 84,38 % | 84 KiB |
| K2-Horizon-MoVA-36B-A4B-MLA (padre), BF16 | MLA | 75,57 GB | 0,1436 / 0,0738 | 84,35 % | 84 KiB |
| K2-Horizon-MoVA-36B-A4B-oQ4e, afín 4 bits | GQA | 22,02 GB | 0,0310 / 0,0156 | 92,44 % | 192 KiB |

El propio autor senala que la MLA pierde mas en 3 de las 31 ventanas de prosa (texto web comun sin repeticiones), donde la divergencia por ventana alcanza 0,47-0,90 en NanoSeedLM-P4 frente a 0,05-0,13 en los modelos GQA, con causa desconocida. La mediana de KLD por ventana es 0,090 para MLA-P4, 0,082 para el MLA BF16 reparado y 0,014 para las semillas GQA S4.

## Requisitos de hardware

- Peso del modelo: 22,89 GB en safetensors, mas la cache KV en BF16 (sin cuantizar la cache).
- Memoria total estimada segun contexto (pesos + cache, en GB decimales): 23,2 GB a 4K, 23,6 GB a 8K, 25,7 GB a 32K, 28,5 GB a 64K, 34,2 GB a 128K y 40,1 GB a 200.000 tokens.
- Plataforma: exclusivamente Apple Silicon mediante MLX. No hay soporte declarado para CUDA, ROCm ni aceleradores tipo A100 o H100 en la informacion disponible.
- Cabe en GPU de consumo: no aplica, al ser un modelo MLX; el equivalente es memoria unificada. Con 32 GB se cubren contextos de hasta ~8K; con 48-64 GB se alcanzan 128K-200K tokens.
- Opciones de despliegue: libreria MLX (`library_name: mlx`) y el cuantizador oMLX; requiere `trust_remote_code` por el fichero `k2_mla.py`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y el propio autor indica que la version actual de oMLX no carga algunas publicaciones previas de la familia sin correcciones en el cargador.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Atention | Parametros | Pesos | KLD held-out / chat | Top-1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| K2-Horizon-MoVA-36B-A4B-MLA-oQ4e (este) | MLA | 37,8 B | 22,89 GB | 0,1548 / 0,0789 | 83,83 % | Apache 2.0 | MLX, Apple Silicon |
| K2-Horizon-MoVA-36B-A4B-MLA-oQ6e | MLA | 37,8 B | 31,74 GB | 0,1446 / 0,0745 | 84,39 % | Apache 2.0 | MLX, Apple Silicon |
| K2-Horizon-MoVA-36B-A4B-MLA-NanoSeedLM-P4 | MLA | 37,8 B | 22,20 GB | 0,1535 / 0,0780 | 83,79 % | Apache 2.0 | MLX, Apple Silicon |
| mlx-community/K2-Horizon-MoVA-36B-A4B-oQ4e | GQA | 37,8 B (≈36 B nominales) | 22,02 GB | 0,0310 / 0,0156 | 92,44 % | Apache 2.0 | MLX, Apple Silicon |

No se dispone de informacion sobre alternativas externas a esta familia (mismo tamano o misma tarea) en los resultados de busqueda proporcionados: no disponible.

## Limitaciones y advertencias

- Es una publicacion de investigacion (research preview), no un modelo validado para produccion. Las cifras de divergencia KL y top-1 no equivalen a una evaluacion de capacidades reales.
- Perdida de fidelidad concentrada: en 3 de las 31 ventanas de prosa, el modelo MLA se desvia en la mayor parte de la ventana (KLD 0,47-0,90 frente a 0,05-0,13 del GQA equivalente). El autor desconoce la causa.
- Degradacion frente a la version con atencion original: el top-1 held-out baja del 92,44 % (GQA oQ4e) al 83,83 % (este modelo), una diferencia sustancial que conviene tener presente antes de elegirlo.
- Solo ingles. No se declara soporte multilingue.
- Solo MLX y Apple Silicon: no hay rutas de despliegue en CUDA ni integracion documentada con servidores de inferencia habituales.
- Requiere ejecucion de codigo personalizado (`trust_remote_code`), lo que implica aceptar codigo del autor en el proceso de carga.
- La cache KV no esta cuantizada: el ahorro de MLA reduce su tamano, pero el consumo sigue creciendo de forma lineal con el contexto.
- Riesgo de alucinacion: no evaluado en la informacion disponible; sin datos de benchmarks de conocimiento o veracidad.
- Sesgos: no documentados en la informacion proporcionada.
- Licencia Apache 2.0, que permite uso comercial, pero sin garantias por parte del autor y con el modelo base sujeto a las condiciones de su propio origen (IFM/K2-Horizon-MoVA-36B-A4B).
- Madurez nula en el momento de la consulta: 0 descargas y 0 likes, publicado y actualizado el mismo dia, sin validacion independiente.
- Se observa una discrepancia entre el nombre del modelo (36B) y el recuento real de parametros de los safetensors (37,78 B).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/txgsync/K2-Horizon-MoVA-36B-A4B-MLA-oQ4e
- Modelo padre (MLA, BF16): https://huggingface.co/txgsync/K2-Horizon-MoVA-36B-A4B-MLA
- Variante NanoSeedLM P4: https://huggingface.co/txgsync/K2-Horizon-MoVA-36B-A4B-MLA-NanoSeedLM-P4
- Variante NanoSeedLM P3: https://huggingface.co/txgsync/K2-Horizon-MoVA-36B-A4B-MLA-NanoSeedLM-P3
- Variante oQ6e: https://huggingface.co/txgsync/K2-Horizon-MoVA-36B-A4B-MLA-oQ6e
- Variante oQ8e: https://huggingface.co/txgsync/K2-Horizon-MoVA-36B-A4B-MLA-oQ8e
- Version con atencion GQA original, oQ4e: https://huggingface.co/mlx-community/K2-Horizon-MoVA-36B-A4B-oQ4e
- Paper TransMLA (Meng, Yao, Zhang, 2025): https://arxiv.org/abs/2502.07864
- Paper SeedLM (Shafipour et al., ICLR 2025): https://arxiv.org/abs/2410.10714
- Los resultados de busqueda web proporcionados no contienen enlaces relevantes al modelo (devuelven listados de Facebook Marketplace sin relacion); no se dispone de blog, repositorio o demo adicionales.
