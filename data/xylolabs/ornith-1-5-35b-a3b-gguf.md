# Xylolabs/Ornith-1.5-35B-A3B-GGUF

## Resumen

Ornith-1.5-35B-A3B-GGUF es la version cuantizada en formato GGUF del modelo Ornith-1.5-35B-A3B, desarrollado originalmente por Ornith AI y convertido a GGUF por Xylolabs para su uso con llama.cpp en CUDA, Metal o CPU. Se trata de un modelo de generacion de texto de arquitectura Mixture of Experts (MoE), con 35.505.251.456 parametros totales y aproximadamente 3.000 millones de parametros activos por token, segun indica el sufijo "A3B" de su nombre. La unica cuantizacion publicada en este repositorio es Q4_K_M, con un tamano de 21,71 GB.

El modelo resuelve el problema de desplegar un modelo MoE de 35B en hardware de consumo o en estaciones de trabajo con memoria limitada, ofreciendo una perdida de calidad medida y documentada: un KL medio de 0,0792 y un 87,63% de coincidencia top-1 respecto a la pasada BF16 de referencia en transformers, evaluado sobre 8.188 posiciones de texto en ingles y coreano. La ventana de contexto es de 256.000 tokens segun las recomendaciones de hardware del autor, aunque el ejemplo de ejecucion usa 8.192 tokens y la tabla de hardware sugiere 32K en GPUs de 24 GB.

Es relevante ahora porque combina una licencia MIT permisiva, soporte multilingue limitado a ingles y coreano, y una tabla de compatibilidad de hardware que abarca desde una RTX 4090 hasta una B300, incluyendo el modo de offload de expertos a RAM del sistema (`--n-cpu-moe`), lo que permite ejecutar el modelo en equipos de 24 GB con contexto reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer; detalles de capas y atencion no disponibles |
| Parametros totales | 35.505.251.456 |
| Parametros activos | aproximadamente 3.000 millones (inferido del sufijo A3B; cifra exacta no disponible) |
| Longitud de contexto | hasta 256K segun la tabla de hardware del autor; 32K en GPUs de 24 GB; el ejemplo de ejecucion usa 8.192 tokens |
| Tipos de cuantizacion | Q4_K_M (unica publicada) |
| Idiomas soportados | ingles (en), coreano (ko) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible confirma que el modelo base es una arquitectura Mixture of Experts con 35.505 millones de parametros totales y aproximadamente 3.000 millones activos por token. El repositorio GGUF no detalla el numero de capas, la dimension del modelo, el numero de expertos ni el mecanismo de enrutamiento. Tampoco se especifican los datos de entrenamiento, el numero de tokens procesados, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El titulo de la cita del modelo original, "Ornith-1.5: From Self-Scaffolding to Self-Improvement", sugiere tecnicas de auto-mejora y andamiaje automatico, pero no se aportan detalles tecnicos en la informacion proporcionada.

La innovacion documentada en este repositorio es la conversion y cuantizacion a GGUF: un unico archivo por cuantizacion que incluye el modelo de lenguaje completo, el tokenizer original y la plantilla de chat. El autor reporta metricas de fidelidad de la cuantizacion Q4_K_M frente a BF16 en transformers: KL medio de 0,0792 y 87,63% de coincidencia top-1 sobre 8.188 posiciones de ingles y coreano. Ademas, se documenta el soporte de offload de pesos de expertos a RAM del sistema mediante el flag `--n-cpu-moe N` de llama.cpp, que permite mantener en GPU los pesos no-expertos y los expertos de las primeras capas, enviando el resto a memoria del sistema.

## Capacidades

- Generacion de texto conversacional en ingles y coreano.
- Razonamiento y generacion de texto de proposito general, segun el pipeline `text-generation` y la etiqueta `conversational`.
- Soporte de plantilla de chat incluida en el archivo GGUF, compatible con `--jinja` de llama.cpp.
- Ejecucion en llama.cpp sobre CUDA, Metal o CPU, con soporte de offload parcial de expertos a RAM.
- Capacidades de tool calling, function calling, agentes, vision, audio o modo thinking: no disponibles en la informacion proporcionada.
- Capacidades multilingues adicionales al ingles y coreano: no disponibles.

## Casos de uso

- Asistente conversacional en ingles o coreano: el modelo puede gestionar dialogos multi-turno usando la plantilla de chat incluida en el GGUF y `llama-server`, con contexto configurable hasta 256K en hardware de 80 GB o superior.
- Despliegue en estaciones de trabajo con una sola GPU de 24 GB: mediante offload de expertos con `--n-cpu-moe` y contexto de 32K, adecuado para prototipos y entornos de desarrollo sin infraestructura de centro de datos.
- Procesamiento de documentos largos en coreano e ingles: la ventana de hasta 256K tokens permite analizar contratos, informes o transcripciones extensas en una sola pasada en hardware con 48 GB o mas.
- Servicio de inferencia local con llama.cpp: `llama-server` expone una API compatible con endpoints, lo que permite integrar el modelo en aplicaciones internas sin dependencia de la nube.
- Traduccion y generacion bilingue ingles-coreano: el modelo esta entrenado para ambos idiomas, lo que lo hace util en flujos de localizacion y atencion al cliente en esos mercados.
- Experimentacion e investigacion en MoE cuantizados: el repositorio aporta metricas de fidelidad de cuantizacion (KL y top-1) que permiten evaluar el impacto de Q4_K_M frente a BF16 en tareas controladas.
- Ejecucion en hardware Apple Silicon: la tabla del autor confirma compatibilidad con Mac Studio M5 Max y M5 Ultra mediante Metal, con contexto de hasta 256K en configuraciones de 128 GB o mas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento publicado es la fidelidad de la cuantizacion:

| Metrica | Q4_K_M frente a BF16 |
|---|---|
| KL medio | 0,0792 |
| Coincidencia top-1 | 87,63% |
| Posiciones evaluadas | 8.188 (ingles y coreano) |

## Requisitos de hardware

- VRAM para inferencia: el archivo Q4_K_M ocupa 21,71 GB. El autor recomienda que el tamano del archivo mas la cache KV en f16 al contexto elegido mas 2 GB de runtime queden por debajo del 90% de la memoria disponible.
- GPU de 24 GB (RTX 4090, RTX 3090): requiere offload de expertos a RAM del sistema; contexto recomendado de 32K.
- GPU de 32 GB (RTX 5090): archivo completo en GPU con contexto de 128K.
- GPU de 48 GB (RTX 6000 Ada o 2 x 24 GB): contexto de 256K.
- GPU de 80 GB (H100): contexto de 256K.
- GPU de 96 GB (RTX PRO 6000 Blackwell): contexto de 256K.
- GPU de 141 GB (H200), 192 GB (B200), 288 GB (B300): contexto de 256K.
- Memoria unificada: DGX Spark (128 GB), Mac Studio M5 Max (128 GB) y Mac Studio M5 Ultra (256 GB y 512 GB) con contexto de 256K.
- Opciones de despliegue: llama.cpp (commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8` o posterior), con `llama-cli` y `llama-server`; soporte de CUDA (`-DGGML_CUDA=ON`) y Metal.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparacion rigurosa. Como referencia estructural, el propio modelo base Ornith-1.5-35B-A3B en safetensors seria la alternativa directa en BF16, con mayor requisito de memoria, y otras cuantizaciones del mismo modelo base no estan documentadas en este repositorio.

## Limitaciones y advertencias

- Idiomas limitados a ingles y coreano; no se garantiza un rendimiento adecuado en castellano ni en otros idiomas.
- Unica cuantizacion disponible (Q4_K_M), con una perdida medible frente a BF16: 87,63% de coincidencia top-1 implica que aproximadamente una de cada ocho predicciones top-1 difiere de la referencia.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan evaluaciones de factualidad en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- La licencia MIT permite uso comercial, pero el repositorio incluye un aviso `NOTICE` que atribuye la autoria del modelo original a su titular; Xylolabs declara no estar afiliado ni respaldado por los autores originales.
- El contexto maximo de 256K depende del hardware; en GPUs de 24 GB el autor recomienda limitarse a 32K.
- El uso de `--n-cpu-moe` reduce el rendimiento al mover expertos a RAM del sistema; el autor no publica cifras de latencia en ese modo.
- No se documentan capacidades de tool calling, agentes, vision ni audio, por lo que no deben asumirse en produccion sin validacion previa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Xylolabs/Ornith-1.5-35B-A3B-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Pagina del modelo original: https://ornith.ai/ornith_1_5.html
- Licencia: https://huggingface.co/Xylolabs/Ornith-1.5-35B-A3B-GGUF/blob/main/LICENSE
- llama.cpp (commit referenciado): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de herramientas de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
