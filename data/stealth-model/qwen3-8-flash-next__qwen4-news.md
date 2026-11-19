# stealth-model/Qwen3.8-Flash-Next__Qwen4-news

## Resumen
Qwen3.8-Flash-Next es un modelo de lenguaje de gran escala desarrollado por Alibaba (familia Qwen) que, segun la model card, funciona como avance de la arquitectura que adoptara la proxima generacion Qwen 4. El repositorio analizado, publicado por Stealth Models, no contiene los pesos originales en safetensors sino una coleccion de cuantizaciones GGUF para llama.cpp, junto con proyectores multimodales (mmproj) y una capa de prediccion multi-token (MTP).

El modelo emplea una arquitectura de mezcla de expertos (MoE) con 512 expertos, de los cuales 10 se activan por token, combinada con atencion dispersa y una memoria de n-gramas aprendida. Con 176.943.899.520 parametros totales, una longitud de contexto nativa de 262.144 tokens ampliable a 1.000.000 mediante YaRN, esta pensado para ejecutarse en maquinas de 16 GB a 128 GB de VRAM/RAM gracias a que solo una fraccion reducida de los pesos (4 a 5,5 GB) debe residir en la GPU.

Su relevancia actual radica en que permite probar sobre hardware de consumo la arquitectura prevista para Qwen 4 antes de la publicacion de los pesos definitivos, con soporte de vision, decodificacion especulativa y un esquema de offload de expertos a RAM del sistema que reduce drastricamente los requisitos de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion dispersa y memoria de n-gramas aprendida |
| Parametros totales | 176.943.899.520 |
| Parametros activos | 10 de 512 expertos por token (numero exacto de parametros activos no disponible) |
| Longitud de contexto | 262.144 tokens nativos; hasta 1.000.000 con YaRN |
| Tipos de cuantizacion | Q2_K_XL, Q4_K_XL, Q5_K_XL; mmproj en Q8_0, F16, Q6_K, Q4_K; MTP en Q8_0 y Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other") |
| Formato de pesos | GGUF (llama.cpp); safetensors solo como referencia del modelo base |

## Arquitectura y entrenamiento
La arquitectura combina mezcla de expertos con 512 expertos por capa y 10 activos por token, atencion dispersa y una tabla de memoria de n-gramas aprendida que actua como memoria per-layer (campo `per_layer_token_embd.weight`). El modelo base declara 48 capas de expertos, segun la guia de configuracion de llama.cpp incluida en la model card. La memoria de n-gramas ocupa 29 GB en cuantizacion Q2 y 54 GB en Q5, y puede residir en RAM o en SSD.

El repositorio incluye ademas una capa de prediccion multi-token (MTP) entrenada por Qwen, que permite decodificacion especulativa con ganancias medidas de 1,3 a 1,7 veces en velocidad de salida segun Unsloth. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card tampoco detalla innovaciones adicionales mas alla de la memoria de n-gramas, la atencion dispersa y el soporte de YaRN para extension de contexto.

## Capacidades
- Generacion de texto conversacional y de proposito general (pipeline `text-generation`).
- Vision: el repositorio incluye proyectores multimodales (mmproj) en varias precisiones, lo que habilita entrada de imagenes.
- Razonamiento multi-paso y modo agente: la model card menciona `endpoints_compatible` y el uso de decodificacion especulativa con `ngram-mod` para tareas de edicion de codigo, resumenes y documentos largos.
- Contexto largo: hasta 262.144 tokens nativos y 1.000.000 con YaRN, adecuado para documentos extensos y conversaciones multi-turno.
- Decodificacion especulativa mediante MTP y `ngram-mod`, que acelera la generacion en escenarios con repeticion de contexto.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Capacidades multilingues: no disponible.
- Compatibilidad con llama.cpp a partir de la build b11971 (28 de octubre).

## Casos de uso
- Procesamiento de documentos largos: con 262.144 tokens nativos y hasta 1.000.000 con YaRN, el modelo puede ingerir contratos, informes o bases de codigo completas en una sola pasada, usando `--rope-scaling yarn --rope-scale 4` para el modo de 1M.
- Edicion y resumen de codigo: la decodificacion especulativa `--spec-type ngram-mod` aprovecha la repeticion del contexto de entrada, lo que acelera tareas de refactorizacion, parcheo y resumenes sobre repositorios.
- Analisis de imagenes y documentos escaneados: los proyectores mmproj (Q8_0, F16, Q6_K, Q4_K) permiten adjuntar vision al servidor llama.cpp para tareas de extraccion de informacion y descripcion de capturas.
- Despliegue en estaciones de trabajo con GPU de consumo: con Q2_K_XL y `--n-cpu-moe 34` en una GPU de 24 GB y 64 GB de RAM se puede servir un contexto de 256k, lo que habilita asistentes locales sin dependencia de la nube.
- Prototipado de la arquitectura Qwen 4: equipos que quieran evaluar el diseno MoE con memoria de n-gramas antes de la publicacion de los pesos definitivos pueden hacerlo con estos GGUF y llama.cpp.
- Servidores con memoria unificada (AMD Strix Halo, NVIDIA DGX Spark): la configuracion Q4_K_XL con todos los expertos en GPU y 128 GB unificados permite servir 256k de contexto con calidad Q4.
- Aceleracion de inferencia en produccion: la capa MTP en Q8_0 o Q4_K_M, combinada con `--spec-type draft-mtp`, reduce la latencia de salida entre 1,3 y 1,7 veces segun las mediciones de Unsloth.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta mediciones de velocidad de decodificacion especulativa con MTP (1,3 a 1,7 veces mas rapido, segun Unsloth) y estimaciones de memoria y contexto por configuracion de hardware.

## Requisitos de hardware
- VRAM en GPU: solo 4 a 5,5 GB deben residir en la GPU; los expertos permanecen en RAM del sistema y la tabla de n-gramas puede residir en SSD.
- Configuracion minima: GPU de 16 GB con 64 GB de RAM y Q2_K_XL (`--n-cpu-moe 42` a 256k, 45 a 1M con maximo de 512k).
- GPU de 24 GB: Q2_K_XL con 64 GB de RAM (`--n-cpu-moe 34` a 256k, 42 a 1M) o Q4_K_XL con 96 GB de RAM (`--n-cpu-moe 41` a 256k, 46 a 1M).
- GPU de 32 GB: Q2_K_XL con 64 GB de RAM (`--n-cpu-moe 26` a 256k, 33 a 1M), Q4_K_XL con 96-128 GB (`--n-cpu-moe 36` a 256k, 41 a 1M) o Q5_K_XL con 128 GB (`--n-cpu-moe 39` a 256k, 42 a 1M).
- Memoria unificada de 128 GB (AMD Strix Halo, NVIDIA DGX Spark): Q4_K_XL con todos los expertos en GPU, 256k de contexto; Q4_K_XL ocupa unos 89 GB y llega a 1M con unos 96 GB.
- Equipos de 192 GB o mas: Q5_K_XL con todos los expertos en memoria unificada.
- Cache KV: 4 bits (`-ctk q4_0 -ctv q4_0`), aproximadamente 2 GB a 256k y 8 GB a 1M.
- MTP: 2,8 GB de VRAM en Q8_0 o 1,9 GB en Q4_K_M; requiere subir `--n-cpu-moe` en 3 (Q2) o 2 (Q4/Q5). Por ahora solo funciona en la rama `qwen4exp/mtp` de llama.cpp de Unsloth; el soporte en llama.cpp oficial sigue en revision.
- Opciones de despliegue: llama.cpp (build b11971 o superior) mediante `llama-server`; no se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Throughput y latencia: no se proporcionan cifras absolutas; solo la mejora relativa de MTP (1,3-1,7x) y la recomendacion de usar `-t` igual al numero de nucleos fisicos y RAM rapida.

## Comparativa con modelos similares
No disponible. La informacion proporcionada no incluye datos de benchmarks ni especificaciones de modelos alternativos de la misma categoria que permitan una comparacion rigurosa.

## Limitaciones y advertencias
- Los pesos son cuantizaciones GGUF de terceros (Stealth Models), no los pesos oficiales de Alibaba; la calidad puede diferir de la version original en safetensors.
- La licencia es `qwen-community-1.0` (etiquetada como "other"): es necesario revisar los terminos del archivo LICENSE enlazado antes de cualquier uso comercial.
- El modelo base es una preview de Qwen 4, no la version final; su comportamiento y arquitectura pueden cambiar cuando se publiquen los pesos definitivos.
- No hay informacion sobre sesgos, idiomas soportados ni datos de entrenamiento, lo que impide evaluar riesgos de sesgo o cobertura linguistica.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado evaluaciones de fiabilidad.
- La configuracion con `--n-cpu-moe` y la tabla de n-gramas en SSD depende del hardware: se recomienda NVMe rapido y RAM de alta velocidad; un disco lento degradara la latencia.
- El soporte de MTP requiere una rama no oficial de llama.cpp (`qwen4exp/mtp`), lo que implica riesgo de inestabilidad y falta de soporte a largo plazo.
- El contexto de 1M solo es alcanzable con YaRN y configuraciones de memoria muy concretas; Qwen recomienda usar YaRN unicamente cuando se necesite esa longitud.
- El tag `endpoints_compatible` sugiere compatibilidad con endpoints, pero no se detalla el alcance ni las garantias de la integracion.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/stealth-model/Qwen3.8-Flash-Next__Qwen4-news
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia: https://huggingface.co/stealth-model/Qwen3.8-Flash-Next__Qwen4-news/blob/main/Qwen3.8-Flash-Next/LICENSE
- Sitio del autor: https://stealthmodels.com
- Imagen social del proyecto: https://stealthmodels.com/qwen-4/assets/social-card-v2.png
