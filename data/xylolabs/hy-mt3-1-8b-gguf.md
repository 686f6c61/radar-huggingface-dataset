# Xylolabs/Hy-MT3-1.8B-GGUF

## Resumen

Hy-MT3-1.8B-GGUF es la distribucion en formato GGUF del modelo de traduccion automatica tencent/Hy-MT3-1.8B, publicada por Xylolabs para su uso con llama.cpp sobre CUDA, Metal o CPU. El modelo base es un transformer denso de 1.791.080.448 parametros (aproximadamente 1,8 mil millones) especializado en traduccion multilingue, con soporte declarado para mas de 100 idiomas, entre ellos espanol, ingles, chino, arabe, hindi, japones, coreano y una amplia representacion de lenguas de bajos recursos (kmer, birmano, cebuano, waray, etc.). La licencia es Apache 2.0 tanto en el modelo base como en esta cuantizacion.

El problema que resuelve es el despliegue eficiente de un traductor neuronal de calidad en hardware modesto: al ofrecer cuantizaciones desde Q8_0 (1,91 GB) hasta Q3_K_M (0,95 GB), permite ejecutar traduccion en GPU de consumo, portatiles y servidores sin aceleradores dedicados, manteniendo una fidelidad medible frente al modelo en BF16. La relevancia actual reside en que la mayoria de los modelos de traduccion de alta calidad requieren infraestructura significativa; esta version reduce la barrera a menos de 2 GB de pesos.

El repositorio incluye una evaluacion cuantitativa propia del proceso de cuantizacion: divergencia KL frente a BF16 sobre WikiText-2, conversaciones y texto reservado, ademas de chrF++ sobre 200 segmentos WMT24++ por direccion de traduccion. Esa documentacion permite elegir el nivel de cuantizacion segun el compromiso entre tamano y perdida de calidad, algo poco habitual en publicaciones de GGUF de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (detalles de capas y atencion no disponibles) |
| Parametros totales | 1.791.080.448 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de uso emplea `-c 8192`) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_M |
| Idiomas soportados | mas de 100, entre ellos es, en, zh, fr, de, it, pt, ru, ar, hi, ja, ko, vi, th, id, tr, nl, pl, uk, fa, he, bn, ta, te, ur, ms, tl, km, my, yue, bo, mn, kk, ug, el, cy, si, ro, ca, pa, hu, gl, sd, bg, eu, as, sr, af, or, hr, lb, kn, sk, mt, ml, sl, eo, sa, sq, yi, lo, mk, hy, jv, be, ka, su, lt, az, ceb, lv, uz, war, et, ky, sw, fi, tk, am, sv, tg, so, da, tt, mg, nb, ba, ht, nn, ku, is, ckb, ga, ps, gd, ne |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base se distribuye en BF16 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de su naturaleza de transformer denso con 1,8 mil millones de parametros y su proposito de traduccion. No se especifican el numero de capas, la dimension del modelo, el mecanismo de atencion ni la estrategia de tokenizacion. Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del corpus, ni si se aplicaron fases de RLHF, DPO o ajuste supervisado.

Lo que si esta documentado es el proceso de cuantizacion realizado por Xylolabs: se generaron siete variantes GGUF, verificadas con el commit `5a09582d80600fb5b0a8966e870061bddc8a3732` de llama.cpp, con soporte de plantilla de chat via `--jinja` y un token EOS identificado como 120020 (fin de turno). La evaluacion de fidelidad usa divergencia KL frente al modelo BF16 en tres conjuntos (WikiText-2, chat y texto reservado, con 40/20/20 fragmentos de 512 tokens) y chrF++ sobre 200 segmentos por direccion de WMT24++.

## Capacidades

- Traduccion automatica multilingue entre mas de 100 idiomas, incluyendo pares con lenguas de bajos recursos.
- Traduccion bidireccional: el modelo acepta instrucciones en lenguaje natural para fijar el idioma destino (por ejemplo, "Translate the following text into Korean").
- Generacion de texto conversacional segun la etiqueta `conversational` del repositorio y el soporte de plantilla de chat con `--jinja`.
- Salida controlada: el ejemplo oficial usa `--temp 0` y limita la generacion a 512 tokens, lo que sugiere un comportamiento determinista adecuado para traduccion.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse mediante la API compatible de llama-server.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Traduccion de documentacion tecnica en pipelines de CI/CD: con Q4_K_M (1,13 GB) se puede integrar en un paso de build que traduzca README y guias a varios idiomas; el chrF++ de 41,44 frente a 41,84 en BF16 indica una perdida marginal de calidad.
- Localizacion de interfaces y cadenas de aplicaciones: el modelo acepta instrucciones de formato estricto ("only output the translated result"), lo que facilita el parseo de la salida en herramientas de gestion de traducciones.
- Atencion al cliente multilingue en entornos con recursos limitados: al caber en CPU y GPU de consumo, permite desplegar traduccion en tiempo real en sedes sin infraestructura GPU dedicada.
- Traduccion de contenido generado por usuarios en foros y redes: la cobertura de mas de 100 idiomas, incluidas lenguas como cebuano, waray o kmer, cubre comunidades que los modelos comerciales suelen ignorar.
- Procesamiento por lotes de corpus en investigación: la version Q8_0 (1,91 GB) ofrece una divergencia KL de 0,001531 en WikiText-2, suficientemente baja para tareas de anotacion o alineacion de corpus.
- Despliegue en dispositivos perifericos o edge: la variante Q3_K_M (0,95 GB) permite ejecutar traduccion en equipos con poca memoria, aceptando una perdida mayor (chrF++ 40,27) a cambio de portabilidad.
- Servicio de traduccion autoalojado con llama-server: el flag `--jinja` y el endpoint compatible permiten exponer una API HTTP interna sin dependencias de terceros.

## Benchmarks y rendimiento

Los unicos datos publicados son los de fidelidad de cuantizacion del propio repositorio (divergencia KL frente a BF16 y chrF++ sobre WMT24++). No se han publicado resultados de benchmarks generales como MMLU, HumanEval o GSM8K en la informacion disponible.

| Cuantizacion | Tamano | KL WikiText-2 | KL chat | KL texto reservado | chrF++ |
|---|---:|---:|---:|---:|---:|
| BF16 | 3,59 GB | — | — | — | 41,84 |
| Q8_0 | 1,91 GB | 0,001531 | 0,001249 | 0,001884 | 41,80 |
| Q8_0 (Tencent) | 1,91 GB | 0,001531 | 0,001249 | 0,001884 | 41,96 |
| Q6_K | 1,47 GB | 0,008176 | 0,005346 | 0,010349 | 41,73 |
| Q4_K_M (Tencent) | 1,35 GB | 0,027942 | 0,025075 | 0,041251 | 41,77 |
| Q5_K_M | 1,30 GB | 0,015369 | 0,012669 | 0,021031 | 41,76 |
| Q4_K_M | 1,13 GB | 0,049448 | 0,044399 | 0,064152 | 41,44 |
| Q4_K_S | 1,08 GB | 0,057202 | 0,050579 | 0,072634 | 41,20 |
| IQ4_XS | 1,03 GB | 0,074203 | 0,056116 | 0,091231 | 41,35 |
| Q3_K_M | 0,95 GB | 0,171603 | 0,149093 | 0,250698 | 40,27 |

## Requisitos de hardware

- VRAM estimada para inferencia: entre 1 y 2 GB para los pesos en las cuantizaciones Q3_K_M a Q8_0, mas el espacio para el contexto KV (dependiente de la ventana configurada; el ejemplo usa 8192 tokens).
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM libre; el modelo es viable en RTX 3060, RTX 4060, RTX 4090, A100 y H100, aunque en estas ultimas el modelo estara infrautilizado.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 4 GB o mas, y tambien en CPU pura.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-completion`) con soporte CUDA, Metal y CPU; al ser GGUF, tambien es compatible con Ollama y otros runners basados en llama.cpp. vLLM y TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles. El ejemplo oficial usa `-ngl 99` para descargar todas las capas en GPU, lo que sugiere que el cuello de botella sera la generacion autoregresiva y no la memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Hy-MT3-1.8B-GGUF (este) | 1,79 B | no disponible | mas de 100 | Apache 2.0 | GGUF |
| tencent/Hy-MT3-1.8B | 1,79 B | no disponible | mas de 100 | Apache 2.0 | BF16 |
| Alternativas de traduccion de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada, por lo que no se ofrece una comparativa con alternativas externas.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo base; al ser un traductor multilingue, es previsible que herede sesgos de sus corpus de entrenamiento, pero no hay datos publicados al respecto.
- Riesgo de alucinacion: no cuantificado. El uso de temperatura 0 en los ejemplos reduce la variabilidad, pero no elimina la posibilidad de traducciones infieles en segmentos ambiguos o idiomas de bajos recursos.
- La longitud de contexto no esta documentada; el ejemplo oficial usa 8192 tokens, pero no se confirma que sea el maximo soportado.
- La calidad en lenguas de bajos recursos (cebuano, waray, kmer, birmano, etc.) no esta evaluada con metricas publicas; el chrF++ reportado es agregado sobre WMT24++ y no desglosa por par de idiomas.
- Las cuantizaciones por debajo de Q4_K_M muestran un aumento marcado de la divergencia KL (Q3_K_M alcanza 0,171603 en WikiText-2), lo que puede degradar la fidelidad en produccion.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar el archivo `NOTICE` y la atribucion correspondiente.
- El modelo esta pensado exclusivamente para traduccion; no debe esperarse razonamiento general, codigo o matematicas de calidad.
- La fecha de creacion del repositorio (2026-11-26) y el numero de descargas (0) indican que se trata de una publicacion muy reciente y sin validacion comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Xylolabs/Hy-MT3-1.8B-GGUF
- Modelo base: https://huggingface.co/tencent/Hy-MT3-1.8B
- Repositorio de herramientas de cuantizacion de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit de llama.cpp verificado: `5a09582d80600fb5b0a8966e870061bddc8a3732` (repositorio https://github.com/ggml-org/llama.cpp)
- No se han encontrado papers, blogs o demos adicionales en la informacion disponible.
