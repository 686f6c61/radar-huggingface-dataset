# webmp3/Sakura-MicroQuality-Kolibri-1-GGUF

## Resumen

Sakura-MicroQuality-Kolibri-1-GGUF es una cuantizacion comunitaria del modelo Kolibri-1 de Aleph Alpha, publicada por el usuario webmp3 bajo la linea Sakura Micro. Se trata de tres archivos GGUF de distinto tamano (IQ2_XS, IQ3_XXS e IQ4_XS) generados a partir del GGUF Q8_0 del modelo original mediante un metodo de asignacion de bits por tensor basado en sensibilidad medida (importance matrix), con mezcla de codecs. No es una publicacion oficial de Aleph Alpha, sino una cuantizacion independiente de la comunidad.

Kolibri-1 es un modelo de mezcla de expertos (MoE) bilingue aleman-ingles de 78.100 millones de parametros totales, de los cuales activa aproximadamente 3.460 millones por token. Emplea 384 expertos enrutados mas un experto compartido por capa, dispone de modo de razonamiento (thinking mode) y soporte de tool calling, y esta orientado a trabajo soberano y mision critica en administraciones publicas e industrias reguladas.

La relevancia de esta ficha radica en que la cuantizacion permite ejecutar un modelo de 78B en equipos de gama alta de consumo: el archivo IQ2_XS ocupa 20,94 GiB y, segun el autor, reduce la divergencia KL entre un 40 % y un 59 % respecto a las recetas estandar de llama.cpp del mismo tamano, medido sobre cuatro textos retenidos (en, dev, wiki, de). Requiere por ahora una version parcheada de llama.cpp porque la arquitectura `kolibri1` aun no esta integrada en la rama principal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE); 384 expertos enrutados mas un experto compartido por capa |
| Parametros totales | 78.103.074.560 (78,1B) |
| Parametros activos | 3.460 millones (3,46B) por token |
| Longitud de contexto | Hasta 1M tokens segun la cobertura de prensa del modelo base; no confirmado en la model card de esta cuantizacion |
| Tipos de cuantizacion | IQ2_XS (2,30 bpw), IQ3_XXS (3,16 bpw), IQ4_XS (4,19 bpw); mezcla de codecs ggml |
| Idiomas soportados | Aleman (de) e ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp parcheado) |

## Arquitectura y entrenamiento

El modelo base Kolibri-1 es un Transformer de mezcla de expertos desarrollado por la empresa alemana Aleph Alpha. Cuenta con 384 expertos enrutados y un experto compartido por capa, con 78,1B parametros totales y 3,46B activos por token. Esta disenado para aleman e ingles, incorpora modo de razonamiento (thinking mode) y soporte de tool calling, y se distribuye bajo licencia Apache 2.0. Aleph Alpha lo posiciona para trabajo soberano y mission-critical en gobierno e industrias reguladas, con contextos de hasta 1M tokens segun la prensa especializada.

Esta ficha corresponde unicamente a la cuantizacion, no al entrenamiento del modelo base. El autor parte del GGUF Q8_0 (considerado casi sin perdida) y aplica un metodo mixed-codec con asignacion del presupuesto de bits por tensor en funcion de la sensibilidad medida mediante una importance matrix. Como resultado, cada archivo se compara contra la receta estandar de llama.cpp de su misma clase de tamano, con la misma importance matrix, los mismos textos y la misma maquina. El autor solo publica los archivos que superan a la receta estandar. Se desconoce la composicion exacta del dataset de entrenamiento, el numero de tokens y si hubo fases de RLHF o DPO: no disponible.

## Capacidades

- Generacion de texto conversacional en aleman e ingles.
- Modo de razonamiento explicito (thinking mode) heredado del modelo base.
- Soporte de tool calling y function calling.
- Razonamiento multi-paso orientado a agentes.
- Capacidad bilingue nativa (aleman e ingles), sin datos publicados sobre otras lenguas.
- Las capacidades de codigo, matematicas y vision no estan documentadas en la informacion disponible para este modelo.

## Casos de uso

- Atencion al cliente automatizada en aleman e ingles: el modelo puede mantener conversaciones multi-turno con contexto largo y cambiar de idioma dentro de la misma sesion, lo que encaja con mercados DACH y entornos corporativos bilingues.
- Asistentes de tramitacion para administracion publica: Aleph Alpha orienta Kolibri a trabajo soberano y regulado, por lo que la cuantizacion permite desplegarlo en infraestructura propia sin depender de APIs externas.
- Agentes con tool calling: integrable en flujos donde el modelo decide que funcion invocar (consultas a bases de datos, busquedas, calculos) y encadena varios pasos de razonamiento antes de responder.
- Procesamiento de documentos largos en aleman: gracias al contexto de hasta 1M tokens del modelo base, puede resumir o extraer informacion de contratos, expedientes o informes extensos.
- Despliegue en hardware de gama alta de consumo: el archivo IQ3_XXS (28,75 GiB) permite ejecutar un 78B en estaciones con 32 GB de VRAM o con reparto CPU/GPU, algo inviable con el modelo en precision alta.
- Generacion de codigo asistida en entornos con requisitos de residencia de datos: al ejecutarse en local, evita enviar codigo propietario a servicios en la nube.
- Sistemas de razonamiento por lotes (batch reasoning): el bajo numero de parametros activos (3,46B) reduce el coste computacional por token frente a un modelo denso de 78B, lo que abarata el procesamiento masivo.

## Benchmarks y rendimiento

En la informacion disponible no hay resultados de benchmarks de tareas estandar (MMLU, HumanEval, GSM8K, etc.). El autor publica metricas de calidad de cuantizacion: divergencia KL de la distribucion de siguiente token frente a la fuente Q8_0 (menor es mejor) y proporcion de veces que se mantiene el token mas probable (mayor es mejor). La perplejidad de referencia del Q8_0 es PPL en: 2,460; dev: 1,928; wiki: 24,848; de: 2,908.

| Archivo / cuantizacion | Tamano | bpw | KLD en | KLD dev | KLD wiki | KLD de | PPL en | Mismo token mas probable |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| Sakura IQ2_XS (este repo) | 20,94 GiB | 2,30 | 0,0758 | 0,0381 | 0,2237 | 0,0987 | 2,462 | 90,5 % |
| IQ2_XS por defecto de llama.cpp | 21,41 GiB | no disponible | 0,1859 | 0,1113 | 0,4540 | 0,2548 | 2,653 | 84,6 % |
| IQ3_XXS por defecto de llama.cpp | 28,12 GiB | no disponible | 0,0917 | 0,0519 | 0,2667 | 0,1187 | 2,453 | 89,6 % |
| Sakura IQ3_XXS (este repo) | 28,75 GiB | 3,16 | 0,0452 | 0,0206 | 0,1283 | 0,0607 | 2,457 | 93,5 % |
| Sakura IQ4_XS (este repo) | 38,07 GiB | 4,19 | 0,0291 | 0,0173 | 0,0886 | 0,0376 | no disponible | 95,0 % |

Segun el autor, la divergencia KL media cae un 59 % (IQ2_XS), un 53 % (IQ3_XXS) y un 40 % (IQ4_XS) respecto a la receta estandar de su clase, con coincidencia del token mas probable mejorada en todos los casos.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el archivo IQ2_XS ocupa 20,94 GiB; el IQ3_XXS, 28,75 GiB; el IQ4_XS, 38,07 GiB. Hay que sumar el coste de la cache KV, que crece con la longitud de contexto y con la ventana de hasta 1M tokens.
- GPU con 24 GB de VRAM (RTX 3090, RTX 4090): el IQ2_XS puede caber con contexto reducido; el IQ3_XXS y el IQ4_XS requieren offload a CPU/RAM o varias GPU.
- GPU con 40-48 GB (A100 40 GB, L40S): IQ2_XS e IQ3_XXS caben con holgura para contextos moderados.
- GPU con 80 GB (A100 80 GB, H100): los tres archivos caben, incluido el IQ4_XS, con margen para contexto.
- Configuraciones multi-GPU (por ejemplo 2 x RTX 4090) o estaciones con 64-128 GB de RAM ofrecen un buen equilibrio para IQ3_XXS e IQ4_XS.
- Gracias a que solo activa 3,46B parametros por token, la carga de calculo es la de un modelo mucho mas pequeno, aunque la huella de memoria sigue siendo la del 78B completo (los expertos deben estar accesibles).
- Opciones de despliegue: llama.cpp (requiere la arquitectura `kolibri1`, aun no en la rama principal; hay que aplicar el parche de Hob-forge/Kolibri-1-GGUF sobre el commit 836d571). No hay confirmacion de soporte en vLLM, TGI, Ollama u otros motores en la informacion disponible.
- Alternativa de motor: el proyecto JustVugg/colibri es un motor en C que hace streaming de expertos desde disco y esta pensado para ejecutar modelos MoE en hardware limitado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Comparativa entre las tres cuantizaciones de este repositorio y las recetas estandar de llama.cpp sobre el mismo modelo base:

| Version | Tamano | KLD medio (4 textos) | Licencia | Disponibilidad |
|---|---|---|---|---|
| Sakura IQ2_XS | 20,94 GiB | 0,1091 (calculado) | apache-2.0 | HuggingFace (este repo) |
| IQ2_XS estandar | 21,41 GiB | 0,2515 (calculado) | apache-2.0 | llama.cpp |
| IQ3_XXS estandar | 28,12 GiB | 0,1323 (calculado) | apache-2.0 | llama.cpp |
| Sakura IQ3_XXS | 28,75 GiB | 0,0637 (calculado) | apache-2.0 | HuggingFace (este repo) |
| Sakura IQ4_XS | 38,07 GiB | 0,0432 (calculado) | apache-2.0 | HuggingFace (este repo) |

Los valores de KLD medio son la media aritmetica de las columnas en, dev, wiki y de de las tablas anteriores. Existe otra cuantizacion GGUF comunitaria del mismo modelo base, Hob-forge/Kolibri-1-GGUF, que aporta el parche necesario para llama.cpp. No se dispone de datos para comparar con modelos densos o MoE de tamano similar de otros fabricantes: no disponible.

## Limitaciones y advertencias

- Es una cuantizacion comunitaria, no oficial, y no ha sido validada por Aleph Alpha.
- La arquitectura `kolibri1` no esta integrada en la rama principal de llama.cpp (peticion de funcionalidad #29922); hasta que eso ocurra hay que aplicar un parche sobre un commit concreto (836d571), lo que dificulta el mantenimiento y las actualizaciones.
- Las cuantizaciones IQ2_XS e IQ3_XXS implican perdida de calidad perceptible; el propio autor advierte que IQ2_XS puede mostrar degradacion visible.
- El modelo es bilingue aleman-ingles; no hay datos publicados sobre su rendimiento en castellano u otras lenguas.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado tasas de fidelidad para este modelo.
- Sesgos conocidos: no disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Kolibri-1 por si hubiera terminos adicionales.
- El contexto de 1M tokens procede de la cobertura de prensa del modelo base, no de la model card de esta cuantizacion; el coste de memoria de la cache KV a esa longitud es muy elevado.
- La calidad declarada se mide con divergencia KL y perplejidad sobre cuatro textos, no con benchmarks de tareas, por lo que no garantiza el rendimiento en aplicaciones concretas.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/webmp3/Sakura-MicroQuality-Kolibri-1-GGUF
- Modelo base: https://huggingface.co/Aleph-Alpha/Kolibri-1
- Cuantizacion GGUF con el parche para llama.cpp: https://huggingface.co/Hob-forge/Kolibri-1-GGUF
- Peticion de soporte de `kolibri1` en llama.cpp: https://github.com/ggml-org/llama.cpp/issues/29922
- Coleccion Sakura Micro: https://huggingface.co/collections/webmp3/sakura-micro-6aba74331f2e996ba1268a92
- Repositorio relacionado (365E): https://huggingface.co/webmp3/Sakura-MicroQuality-Kolibri-1-365E-GGUF
- Motor colibri (JustVugg) en GitHub: https://github.com/JustVugg/colibri
- Sitio del motor colibri: https://justvugg.github.io/colibri/
- Noticia sobre el lanzamiento de Kolibri con contexto de 1M: https://www.testingcatalog.com/aleph-alpha-releases-open-weight-kolibri-with-1m-context/
- Analisis del modelo Kolibri: https://www.online-tech-tips.com/aleph-alpha-kolibri-sovereign-open-weight-ai-model/
