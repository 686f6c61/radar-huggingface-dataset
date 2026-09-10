# vcruz305/DSV4.1-Flash-EXL3-TP4

## Resumen

DSV4.1-Flash-EXL3-TP4 es un paquete de cuantizacion comunitario creado por el usuario vcruz305 a partir de deepseek-ai/DeepSeek-V4.1-Flash, el modelo multimodal de tipo Mixture-of-Experts (MoE) publicado por DeepSeek-AI. El objetivo del paquete no es reentrenar ni afinar el modelo, sino comprimir sus pesos con el esquema EXL3 (ExLlamaV3) para que quepan en un nodo de cuatro NVIDIA DGX Spark (GB10, 128 GiB cada uno, 448 GiB agregados), con un presupuesto de pesos serializados estimado en unos 417 GiB. Se trata, por tanto, de una pieza de infraestructura de inferencia, no de un modelo nuevo.

El modelo subyacente es relevante por su escala y por su estrategia de compresion de cache: un backbone MoE de 552B parametros con hasta 1M de contexto, arquitectura Causal Encoder-Decoder (CED) de 40 capas (20 encoder + 20 decoder), 384 expertos enrutados con top-6 mas uno compartido, 8B de parametros activos en prefill y 16B en decode, y una tabla de memoria dispersa Engram de ~196B. Su mecanismo CSA2 combinado con KV en FP4 reduce la cache global a 890 bytes por token, que es la innovacion central que declara el autor del modelo original.

El pack EXL3 se encuentra en estado **incomplete**: la conversion esta en curso en una maquina de 8x L40S a partir del release publico en FP8+FP4 (~510,3 GB, 48 shards) y los shards se suben a medida que terminan. La propia model card advierte de que no debe tratarse como un checkpoint cargable hasta que `conversion_status` pase a `complete`, y de que ExLlamaV3 todavia no puede cargar DeepSeek-V4.1 de extremo a extremo porque los forwards de CED, Engram y CSA2 siguen pendientes de portar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Causal Encoder-Decoder (CED) de 40 capas (20 encoder + 20 decoder), MoE multimodal; mecanismos Engram, CSA2 y DSpark |
| Parametros totales | 552B en el backbone, mas ~196B de memoria dispersa Engram (modelo original); el pack cuantizado no declara recuento propio |
| Parametros activos | 8B en prefill y 16B en decode; MoE con 384 expertos enrutados, top-6, mas 1 compartido |
| Longitud de contexto | Hasta 1M tokens (modelo original) |
| Tipos de cuantizacion | EXL3 K3 (~3,25 bpw planificados) en expertos enrutados; tablas Engram en FP8 nativo; vision copiada fuera del presupuesto EXL3 de expertos; origen en FP8+FP4 |
| Idiomas soportados | no disponible |
| Licencia | MIT (igual que la release DeepSeek-V4.1-Flash) |
| Formato de pesos | EXL3 (ExLlamaV3); el repositorio no especifica el contenedor exacto |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4.1-Flash es un MoE multimodal con backbone de 552B parametros y una arquitectura Causal Encoder-Decoder de 40 capas, dividida en 20 capas de encoder y 20 de decoder. El enrutamiento MoE emplea 384 expertos con seleccion top-6 mas un experto compartido, lo que da lugar a 8B parametros activos durante el prefill y 16B durante el decode. Incorpora tres componentes propios: Engram, una memoria dispersa de ~196B parametros; CSA2, un esquema de compresion de cache que junto con el almacenamiento de KV en FP4 reduce la cache global a 890 bytes por token; y DSpark, el mecanismo de decodificacion especulativa que el modelo trae integrado. La model card no detalla la composicion del dataset de entrenamiento, el numero de tokens vistos ni si hubo fases de RLHF o DPO.

Este repositorio concreto no entrena nada: aplica cuantizacion EXL3 sobre los pesos publicados. La conversion usa la herramienta SAGE `vcruz305/SAGE-EXL3` en su revision `4eaa17d` o posterior, con el perfil `tp4_quality_first` y cuantizacion K3 de aproximadamente 3,25 bits por peso en los expertos enrutados. Las tablas Engram se mantienen en FP8 nativo en lugar de rebajarlas a BF16 de forma indiscriminada, los tensores borrador de DSpark se preservan para las capas 37 a 39 con block size 5, y la torre de vision se copia sin cuantizar y queda fuera del presupuesto EXL3 del cuerpo de expertos. El ajuste de memoria se calcula solo sobre pesos serializados: ~417 GiB estimados frente a los 448 GiB disponibles en cuatro DGX Spark. La model card subraya que V4.1 no puede reutilizar la clase V4 de ExLlamaV3, ya que las relaciones de compresion son 0/1/2 frente a 0/4/128, y que los forwards de CED, Engram y CSA2 estan todavia por portar, de modo que el soporte de carga completo no esta garantizado.

## Capacidades

- Generacion de texto multimodal: el modelo original procesa texto e imagen, ya que la torre de vision se conserva en este pack.
- Razonamiento y contexto largo: ventana de hasta 1M tokens con cache KV comprimida a 890 bytes por token mediante CSA2 y FP4, lo que hace viable mantener conversaciones o documentos muy extensos en memoria.
- Computo eficiente por enrutamiento disperso: solo se activan 8B parametros en prefill y 16B en decode sobre un total de 552B, lo que reduce el coste por token respecto a un modelo denso de tamano equivalente.
- Decodificacion especulativa integrada mediante DSpark, con tensores borrador preservados en el pack cuantizado.
- Uso de memoria dispersa a largo plazo gracias a las tablas Engram de ~196B, conservadas en FP8 nativo.
- Parametros de muestreo recomendados por el autor original: `temperature=1.0` y `top_p=0.95`.
- Soporte de tool calling, function calling y flujos de agente: no confirmado en la informacion disponible para este pack; la model card menciona que el repositorio upstream incluye tablas agenticas, pero no se reproducen aqui.
- Capacidades multilingues: no disponibles.
- Modo thinking explicito: no disponible.

## Casos de uso

- Despliegue de inferencia en nodos DGX Spark: el pack esta disenado especificamente para cuatro GB10 con 128 GiB cada uno, de modo que un equipo con ese hardware puede servir el modelo cuantizado sin recurrir a un cluster de GPUs de datacenter.
- Procesamiento de documentos de gran extension: con hasta 1M tokens de contexto y una cache KV de 890 bytes por token, es adecuado para analizar expedientes, normativa o bases de codigo completas en una sola pasada.
- Evaluacion comparativa de tecnicas de cuantizacion: al usar SAGE con el perfil `tp4_quality_first` y K3 a ~3,25 bpw, sirve como punto de referencia para medir la perdida de calidad frente al release FP8+FP4 original.
- Analisis de documentos con componente visual: la torre de vision se conserva fuera del presupuesto EXL3, por lo que permite tareas sobre paginas escaneadas o capturas sin degradar esa parte a la cuantizacion de expertos.
- Investigacion en memoria dispersa: las tablas Engram en FP8 nativo permiten estudiar el comportamiento de la memoria de largo plazo del modelo bajo compresion sin alterar ese componente.
- Experimentacion con decodificacion especulativa: los tensores borrador de DSpark se preservan en las capas 37 a 39, lo que facilita reproducir y medir el mecanismo especulativo sobre pesos cuantizados.
- Pruebas de portado de arquitecturas no soportadas: dado que CED, Engram y CSA2 siguen pendientes de implementacion en ExLlamaV3, el repositorio es un caso de estudio sobre las dificultades de llevar arquitecturas hibridas recientes a runtimes de cuantizacion existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explicita que las cifras de evaluacion del repositorio upstream son de DeepSeek y que no se han remedido para este pack EXL3; ademas, el repositorio esta en estado `incomplete`, por lo que no existe un checkpoint completo sobre el que medir.

## Requisitos de hardware

- VRAM estimada: ~417 GiB de pesos serializados segun el modelo de ajuste del autor, frente a 448 GiB disponibles. No se declara overhead de activaciones, cache KV ni buffers de runtime.
- Hardware objetivo: cuatro NVIDIA DGX Spark (GB10, 128 GiB cada uno), reparto TP4.
- Hardware de conversion: 8x NVIDIA L40S, usado para transformar el release publico de 48 shards en FP8+FP4 (~510,3 GB). No es el hardware de destino.
- GPU de consumo: no cabe en ninguna GPU de consumo. Un solo DGX Spark de 128 GiB tampoco es suficiente para el modelo completo con este presupuesto de pesos.
- Opciones de despliegue: EXL3 implica ExLlamaV3, pero la model card advierte de que ExLlamaV3 no puede cargar DeepSeek-V4.1 de extremo a extremo todavia, ya que los forwards de CED, Engram y CSA2 siguen pendientes de portar. El tag `endpoints_compatible` aparece en el repositorio, pero no se detallan integraciones concretas.
- Latencia y throughput: no disponibles.
- Estado de disponibilidad: conversion en curso; los pesos del repositorio estan incompletos hasta que se suba la lista completa de shards.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DSV4.1-Flash-EXL3-TP4 (este repositorio) | 552B backbone + ~196B Engram (heredados) | Hasta 1M tokens | EXL3 K3 ~3,25 bpw en expertos, Engram FP8, vision sin cuantizar | MIT | Incompleto, conversion en curso |
| deepseek-ai/DeepSeek-V4.1-Flash (upstream) | 552B backbone + ~196B Engram | Hasta 1M tokens | FP8+FP4, 48 shards, ~510,3 GB | MIT | Publicado por DeepSeek-AI |
| Familia DeepSeek-V4 | no disponible | no disponible | Relaciones de compresion 0/4/128 | no disponible | Clase distinta en ExLlamaV3 |

No se dispone de datos de rendimiento comparado entre estas variantes, ni de otros packs cuantizados de V4.1 con los que contrastar parametros, contexto o throughput. La diferencia documentada mas relevante entre V4 y V4.1 es la in compatibilidad de las relaciones de compresion (0/1/2 frente a 0/4/128), que impide reutilizar la clase V4 existente en ExLlamaV3.

## Limitaciones y advertencias

- El repositorio esta en estado `incomplete`. Los pesos no deben tratarse como un checkpoint cargable hasta que `conversion_status` indique `complete`.
- ExLlamaV3 no puede cargar DeepSeek-V4.1 de extremo a extremo en la fecha de la model card: los forwards de CED, Engram y CSA2 estan pendientes de portar. El propio autor califica la afirmacion contraria como no sostenible.
- El bug de compatibilidad con la clase V4 (relaciones de compresion 0/1/2 frente a 0/4/128) implica que no se puede reutilizar codigo existente sin modificaciones.
- La cuantizacion EXL3 a ~3,25 bpw introduce perdida de calidad respecto al release FP8+FP4 original. No se han publicado mediciones de esa degradacion para este pack.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-09-10). No hay evidencia de uso en produccion ni de validacion por terceros.
- La estimacion de encaje de ~417 GiB frente a 448 GiB considera unicamente pesos serializados; no incluye activaciones, cache KV, buffers de comunicacion para TP4 ni overhead del runtime, por lo que el margen real puede ser mucho menor.
- Los idiomas soportados no estan declarados, lo que impide garantizar cobertura multilingue en produccion.
- El soporte de tool calling y de flujos de agente no se documenta para este pack.
- No se detalla la composicion del dataset ni el proceso de alineacion del modelo original, por lo que no se pueden evaluar sesgos conocidos desde esta ficha.
- Riesgo de alucinacion: inherente a los modelos generativos de este tipo; no se han publicado evaluaciones de fidelidad para el pack cuantizado.
- Licencia MIT, igual que el modelo base, lo que permite uso comercial sin restricciones adicionales declaradas, pero el estado incompleto del repositorio limita su uso practico.

## Enlaces

- Repositorio del pack cuantizado: https://huggingface.co/vcruz305/DSV4.1-Flash-EXL3-TP4
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Herramienta de conversion SAGE-EXL3: https://huggingface.co/vcruz305/SAGE-EXL3
- Perfil de autor: https://huggingface.co/vcruz305
- Cita del modelo original: DeepSeek-AI, 2026, "DeepSeek-V4.1-Flash: Pushing the Limits of KV Cache Compression" (BibTeX incluido en la model card)
- No se encontraron enlaces adicionales relevantes (papers, blogs, demos o repos) en la busqueda web realizada.
