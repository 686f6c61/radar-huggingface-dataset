# ytjacky/GLM-5.2-colibri-E8-IQ3-with-int8-mtp

## Resumen

GLM-5.2-colibri-E8-IQ3-with-int8-mtp es un contenedor cuantizado del modelo base zai-org/GLM-5.2 preparado por el usuario ytjacky para el motor de inferencia colibrì. Se trata de un MoE de 744B parametros (78 capas, 256 expertos enrutados) cuyos expertos se almacenan en formato E8 lattice/IQ3 (fmt=6) a 3,06 bits por peso, con una cabeza MTP (multi-token prediction) en int8. La conversion se hizo directamente desde los pesos FP8 del modelo padre, no desde otro contenedor cuantizado.

Su relevancia es muy concreta: reduce el contenedor de 429,3 GB (int4-g64, 4,50 bpw) a 289,1 GB, un 33% menos de disco, y en un host que hace streaming de expertos desde NVMe resulta entre un 22% y un 33% mas rapido, con una perdida de calidad no medible en tres benchmarks internos. A cambio, el decodificado E8 es mas caro por experto que int4, por lo que el contenedor es mas lento que int4-g64 si todos los expertos caben ya en memoria.

El publico objetivo declarado es el de maquinas con poca GPU ("gpu-poor"): el punto de referencia de la model card es un RTX 5080 de 16 GB con un Core Ultra 9 285K y 128 GB de DDR5. El repositorio incluye un historico de uso (`.coli_usage`) con 6.592.176 selecciones de expertos registradas, que permite un emplazamiento informado de las capas residentes desde la primera ejecucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (etiqueta `glm_moe_dsa`); 78 capas, 256 expertos enrutados |
| Parametros totales | 744B (MoE de la familia GLM-5.2, segun la model card del contenedor y el repo del motor) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | E8 lattice / IQ3 en formato `fmt=6`, 3,06 bits por peso (nominal 3-bit); cabeza MTP en int8. Contenedor hermano de referencia: int4-g64 a 4,50 bpw |
| Idiomas soportados | no disponible |
| Licencia | MIT (declarada por el autor del contenedor; verificar los terminos del modelo base zai-org/GLM-5.2) |
| Formato de pesos | Contenedor propietario de colibrì (fmt=6), cargado por el motor colibrì; no es GGUF ni un safetensors estandar consumible por llama.cpp, vLLM o TGI |
| Tamano del repositorio | 299,0 GB (289,1 GB de contenedor segun la model card) |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 1 de octubre de 2026 |

## Arquitectura y entrenamiento

El contenedor no introduce entrenamiento propio: es una recuantizacion del modelo base zai-org/GLM-5.2, un transformer con mezcla de expertos (MoE) descrito con 744B parametros, 78 capas y 256 expertos enrutados. La innovacion tecnica del artefacto esta en la representacion numerica de los expertos: cada bloque usa una retícula E8 (IQ3) con las escalas almacenadas dentro del propio bloque, en lugar del esquema agrupado de int4. Eso es precisamente lo que rompia las versiones antiguas del motor: los builds anteriores a v1.4.0 no reconocian `fmt=6`, caian en la ruta CUDA generica de expertos agrupados, decodificaban como int2 y desreferenciaban un puntero nulo a escalas (corregido en el commit `a842d50`). La cabeza MTP se mantiene en int8 para no degradar la prediccion multi-token.

La cuantizacion se hizo partiendo de los pesos FP8 originales, lo que evita la acumulacion de error que se produce al recuantizar desde otro contenedor ya comprimido. El autor documenta el compromiso con numeros medidos sobre la misma maquina, misma prompt y misma configuracion: el matmul de expertos pasa de 20,9 s a 24,1 s sobre 64 tokens decodificados, es decir, decodificar E8 cuesta mas por experto que int4. La ventaja no viene de la aritmetica sino de la residencia: expertos mas pequenos significan mas expertos en RAM, y en un host que hace streaming desde disco la tasa de acierto es determinante (97,4% frente a 93,3%). El repositorio incorpora ademas un fichero `.coli_usage` con 6.592.176 selecciones de expertos que alimenta `PIN=auto`; el autor cifra su aportacion en unos 16 puntos de pin-hit rate (72,8% frente a 56,9% en frio).

## Capacidades

- Generacion de texto con el modelo base GLM-5.2 como referencia; este repositorio no aporta ni retira capacidades, solo cambia la representacion de los pesos.
- Modo de razonamiento explicito: el motor escribe `<think></think>` ya cerrado en el prompt salvo que se active `THINK=1`, de modo que sin esa variable el modelo responde "por reflejo" y no razona.
- Decodificacion con prediccion multi-token mediante la cabeza MTP en int8.
- Capacidades de tool calling, agentes, codigo, matematicas o vision: no disponibles en la informacion proporcionada para este contenedor.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Inferencia local de un MoE de 744B en hardware de gama alta de consumo: con 289 GB de disco y un RTX 5080 de 16 GB mas 128 GB de DDR5, el contenedor arranca y decodifica a 1,57 tok/s haciendo streaming de expertos desde NVMe. Es el escenario de validacion que documenta el autor.
- Despliegue en hosts con restriccion de disco: si el presupuesto de almacenamiento es el factor limitante, este contenedor ahorra 140 GB frente al int4-g64 (289,1 GB frente a 429,3 GB) manteniendo la calidad medida.
- Maquinas con memoria unificada (DGX Spark/GB10, Apple silicon): el tier de expertos y el presupuesto de RAM son las mismas paginas fisicas, asi que este contenedor, al ser mas pequeno, permite un reparto mas holgado y reduce el riesgo de que el proceso muera a mitad de prefill.
- Experimentacion con formatos de cuantizacion no estandar: sirve para medir el equilibrio entre bits por peso, coste de decodificado y tasa de acierto de expertos en un mismo modelo, comparando directamente contra el contenedor int4-g64.
- Servicio de bajas prestaciones pero alta privacidad: al ejecutarse en local sin API externa, encaja en escenarios donde el texto no puede salir de la maquina y el throughput no es critico (por ejemplo, resumen nocturno por lotes).
- Evaluacion comparativa de motores de inferencia: la model card ofrece numeros reproducibles (tok/s, tasa de acierto, tiempo de matmul de expertos) sobre una configuracion concreta, utiles como linea base en pruebas de motores.
- Investigacion sobre emplazamiento de expertos: el `.coli_usage` versionado permite estudiar politicas de pinning y enrutado con un historico real de 6,59 millones de selecciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las unicas cifras publicadas son mediciones internas del autor sobre una caja de referencia (RTX 5080 sm_120 de 16 GB, Core Ultra 9 285K, 128 GB DDR5-4400, NVMe, Windows), con la misma prompt y la misma configuracion para ambos contenedores:

| Metrica | int4-g64 (4,50 bpw) | Este contenedor (3,06 bpw) |
|---|---:|---:|
| Decodificado, colibrì v1.4.0 | 1,18 tok/s | 1,57 tok/s |
| Tasa de acierto de expertos | 93,3% | 97,4% |
| Tamano en disco | 429,3 GB | 289,1 GB |
| Calidad, benchmark de 40 preguntas | referencia | sin perdida medible |
| Matmul de expertos (64 tokens decodificados) | 20,9 s | 24,1 s |

Resumen del perfil: un 22-33% mas rapido en hosts con streaming desde NVMe, y mas lento en hosts donde los expertos ya residen enteros en memoria.

## Requisitos de hardware

- Disco: unos 290 GB libres (289,1 GB de contenedor; el repositorio ocupa 299,0 GB).
- VRAM: los tensores densos y de atencion de GLM-5.2 ocupan aproximadamente 13,5 GB en la GPU. En la caja de referencia, un RTX 5080 de 16 GB, se recomienda `CUDA_EXPERT_GB=4` y reservar 1 GB (`CUDA_RESERVE_GB=1`).
- Si cabe en GPU de consumo: si, segun el autor, en una GPU de 16 GB, pero con el modelo operando por streaming desde disco y a 1,57 tok/s. En configuraciones multi-GPU se menciona un host de 6x RTX 5090 con un tier de expertos de 125 GB.
- Memoria del sistema: tanta como se pueda; la residencia de expertos determina el throughput mas que cualquier otro ajuste. En hosts de memoria unificada, `CUDA_EXPERT_GB` + `RAM_GB` deben sumar por debajo de la memoria fisica o el proceso se mata durante el prefill.
- Motor de despliegue: exclusivamente colibrì, version v1.5.0 o superior. La v1.4.0 es el minimo funcional (anteriormente el contenedor provocaba un fallo por puntero nulo a escalas); la v1.5.0 es el minimo recomendado por seguridad, tras ocho avisos publicados, dos de ellos en el cargador de safetensors/tokenizer. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 1,57 tok/s en decodificado sobre la caja de referencia; 24,1 s de matmul de expertos por cada 64 tokens decodificados. No hay datos de throughput en prefill ni de latencia por peticion.
- Variable relevante: `THINK=1` es necesario para tareas que requieran razonamiento; sin ella el modelo no activa la fase de pensamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este repositorio (ytjacky) | 744B MoE | E8/IQ3 fmt=6, 3,06 bpw + MTP int8 | 289,1 GB | no disponible | MIT (declarada) | HuggingFace, 0 descargas |
| Contenedor int4-g64 del mismo autor (referencia interna) | 744B MoE | int4 agrupado, 4,50 bpw | 429,3 GB | no disponible | MIT (declarada) | citado en la model card |
| zai-org/GLM-5.2 (modelo base) | 744B MoE | FP8 | no disponible | no disponible | no disponible | HuggingFace, modelo oficial |
| mastouri/GLM-5.2-colibri-E8-IQ3-with-int8-mtp (espejo) | 744B MoE | E8/IQ3 fmt=6, 3,06 bpw + MTP int8 | no disponible | no disponible | no disponible | HuggingFace |

No hay datos publicados de benchmarks estandar que permitan comparar el rendimiento de este contenedor con modelos de la misma categoria distintos de su propio contenedor hermano.

## Limitaciones y advertencias

- Rendimiento dependiente del host: en maquinas donde todos los expertos ya caben en memoria, este contenedor es mas lento que int4-g64. La compresion no acelera la aritmetica; solo ayuda cuando la residencia esta por debajo del techo.
- Throughput bajo: 1,57 tok/s en la configuracion medida. No es apto para uso interactivo ni para servir a varios usuarios.
- Formato experimental: `fmt=6` (E8/IQ3) es un formato no estandar, soportado unicamente por colibrì v1.4.0+. No es consumible por el ecosistema GGUF/llama.cpp/vLLM/TGI.
- Fallo conocido con motores antiguos: builds anteriores a v1.4.0 decodifican `fmt=6` como int2 y desreferencian un puntero nulo a escalas, lo que provoca un crash.
- Riesgo de seguridad en la carga: la propia documentacion de colibrì clasifica un modelo descargado de un repositorio de terceros en HuggingFace como entrada no confiable. Dos avisos (GHSA-wc4x-3786-cxh7 y GHSA-4gw4-j89j-4c8r) describen escrituras fuera de limites en el heap antes de ejecutar inferencia, por metadatos de tensor no validados y por un token id negativo. El autor del contenedor declara que los pesos son su propia conversion y no son hostiles, pero reconoce que no es verificable desde fuera.
- Modo de razonamiento desactivado por defecto: sin `THINK=1`, el motor inyecta `<think></think>` cerrado en la plantilla y el modelo responde sin deliberar, lo que puede interpretarse erroneamente como un fallo de cuantizacion.
- Memoria unificada: en DGX Spark/GB10 y Apple silicon, un reparto incorrecto de `CUDA_EXPERT_GB` + `RAM_GB` provoca la muerte del proceso durante el prefill.
- Licencia: el repositorio declara MIT, pero es una cuantizacion derivada de zai-org/GLM-5.2; conviene verificar los terminos del modelo base antes de un uso comercial.
- Idiomas, sesgos y riesgo de alucinacion especificos: no disponibles en la informacion proporcionada.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de las cifras publicadas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ytjacky/GLM-5.2-colibri-E8-IQ3-with-int8-mtp
- Modelo base: https://huggingface.co/zai-org/GLM-5.2
- Motor colibrì (GitHub): https://github.com/JustVugg/colibri
- Pagina del proyecto colibrì: https://justvugg.github.io/colibri/
- Avisos de seguridad de colibrì: https://github.com/JustVugg/colibri/security/advisories
- Aviso GHSA-wc4x-3786-cxh7: https://github.com/JustVugg/colibri/security/advisories/GHSA-wc4x-3786-cxh7
- Aviso GHSA-4gw4-j89j-4c8r: https://github.com/JustVugg/colibri/security/advisories/GHSA-4gw4-j89j-4c8r
- Issue colibri#814 (modo THINK): https://github.com/JustVugg/colibri/issues/814
- Issue colibri#759 (memoria unificada): https://github.com/JustVugg/colibri/issues/759
- Copia espejo del contenedor: https://huggingface.co/mastouri/GLM-5.2-colibri-E8-IQ3-with-int8-mtp
- Guia de ejecucion en hardware reducido: https://github.com/TrenderSwap/colibri-GLM-5.2
- Ficha de directorio de modelos: https://essamamdani.com/ai-models/hf-mastouri-glm-5-2-colibri-e8-iq3-with-int8-mtp
