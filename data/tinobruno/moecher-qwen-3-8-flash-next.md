# TinoBruno/moecher-qwen-3.8-flash-next

## Resumen

Qwen 3.8 Flash-Next (GSQ-RCO-IQ1_M) es un modelo multimodal de tipo image-text-to-text empaquetado por el autor TinoBruno bajo el identificador `moecher-qwen-3.8-flash-next` para el runtime bare-metal de agentes MinnieTheMoEcher. Se presenta como una variante optimizada de la familia Qwen orientada a despliegue en hardware de consumo, con pesos cuantizados en un esquema heterogéneo denominado GSQ-RCO-IQ1_M y un formato propietario dividido en ficheros binarios y un GGUF parcial. La arquitectura declarada, `qwen4exp`, combina 48 capas híbridas de Gated DeltaNet SSM (36 capas) con atención GQA completa (12 capas), conexiones hipergeométricas y una mezcla dispersa de expertos con 256 expertos enrutados por capa y `top_k = 10`.

El modelo resuelve el problema de ejecutar un MoE multimodal grande en GPUs de 16 GB de VRAM mediante un diseño de dos niveles: un conjunto denso residente en VRAM (`resident.bin`, ~4,15 GB) y los expertos enrutados (`experts.bin`, ~23,42 GB) transmitidos por DMA asíncrono desde DRAM del host. Según la model card, alcanza ~113 tok/s de prefill y ~20,5 tok/s de decode en una RTX 5060 Ti de 16 GB con 32-64 GB de DDR5.

Es relevante ahora por su enfoque en eficiencia de memoria y soporte de tool calling y visión, aunque se trata de un paquete de despliegue muy específico, con licencia Apache 2.0, publicado en noviembre de 2026 y sin descargas ni valoraciones en el momento de la consulta. El dato real de safetensors indica 448.931.056 parámetros totales, cifra que no concuerda con la descripción de la model card de un MoE de gran escala, por lo que debe tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen4exp`: híbrida Gated DeltaNet SSM (36 capas) + GQA completa (12 capas), Hyper-Connections (`hc_mult = 4`, `D_hc = 10.240`), Per-Layer Embedding (PLE) y MoE disperso |
| Parametros totales | 448.931.056 (safetensors); la model card describe 256 expertos enrutados por capa y `top_k = 10` sin cifra agregada |
| Parametros activos | no disponible (solo `top_k = 10` más 1 experto compartido con compuerta) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GSQ-RCO heterogénea: `Q6_K`, `Q5_K`, `Q4_K`, `IQ4_XS`, `BF16` en denso; `IQ1_M`, `IQ2_XXS`, `IQ2_XS`, `IQ2_S`, `IQ3_XXS`, `IQ3_S`, `Q2_K`, `Q3_K`, `Q4_K`, `IQ4_NL`, `IQ4_XS` en expertos; PLE en `IQ4_NL`; visión en `BF16` |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | `resident.bin`, `experts.bin`, `moecher_manifest.json`, GGUF parcial (`Qwen3.8-Flash-Next-GSQ-RCO-IQ1_M-00002-of-00002.gguf`), `mmproj-...-BF16.gguf`, `tokenizer.json` (BPE, vocab 248.320) |

## Arquitectura y entrenamiento

La arquitectura descrita, `qwen4exp`, es híbrida: 48 capas totales, de las cuales 36 son Gated DeltaNet SSM y 12 son atención GQA completa. Incorpora Hyper-Connections con `hc_mult = 4` y dimensión `D_hc = 10.240`, una tabla de Per-Layer Embedding (PLE) de 320M de n-gramas con forma `[160, 320001536]` y una capa MoE con 256 expertos enrutados por capa más un experto compartido con compuerta. El tokenizador es BPE con vocabulario de 248.320 entradas.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La model card no documenta el proceso de entrenamiento del modelo base, sino únicamente el empaquetado y la cuantización. La innovación técnica destacable es el esquema de cuantización Rate-Constrained Optimization (RCO) con asignación heterogénea por tensor y por experto, registrada en `rco-allocation.txt`, junto con un perfil calibrado de frecuencia de activación de expertos (`expert_freq.bin`) para precalentar cachés L1/L2 y una doble bufferización DMA asíncrona para transmitir expertos desde DRAM del host.

## Capacidades

- Generación de texto y razonamiento en inglés y chino.
- Procesamiento multimodal image-text-to-text mediante torre de visión BF16 (`mmproj`) y proyector.
- Tool calling y function calling, según los tags del repositorio.
- Orientación a flujos agénticos y razonamiento multi-paso (tag `agentic`).
- Mezcla de expertos dispersa con enrutamiento por token (`top_k = 10`) más experto compartido.
- Tabla PLE de n-gramas para representaciones por capa.
- Capacidades de código y matemáticas: no documentadas explícitamente en la información disponible.
- Modo thinking, audio u otras modalidades: no disponible.

## Casos de uso

- Agentes conversacionales con tool calling: el modelo expone soporte de function calling y tags agénticos, lo que permite integrarlo en bucles de razonamiento multi-paso que invocan APIs externas y consultan resultados intermedios.
- Asistentes multimodales en local: gracias a la torre de visión BF16 y al pipeline image-text-to-text, puede procesar capturas, diagramas o documentos escaneados en entornos sin conectividad.
- Despliegue en estaciones de trabajo con GPU de consumo: el diseño residente/streamed permite ejecutar el modelo en una RTX 5060 Ti de 16 GB con 32-64 GB de DDR5, útil para prototipado y demos internas.
- Automatización de soporte en inglés y chino: los dos idiomas soportados cubren mercados bilingües concretos, con respuestas multi-turno siempre que se valide la longitud de contexto real.
- Análisis de imágenes en pipelines de documentación técnica: extracción de información de figuras y diagramas combinada con generación de texto descriptivo.
- Investigación en eficiencia de inferencia: el paquete incluye manifiesto de tensores, log de asignación RCO y perfil de frecuencia de expertos, lo que facilita reproducir experimentos de cuantización heterogénea y política de caché.
- Integración en runtimes bare-metal: el manifiesto `moecher_manifest.json` y el binario `moecher` permiten levantar un servidor en el puerto 8001 para pruebas de latencia y throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La única métrica de rendimiento aportada por la model card es de inferencia en hardware concreto: ~113 tok/s de prefill y ~20,5 tok/s de decode en una GeForce RTX 5060 Ti de 16 GB con 32-64 GB de DDR5, con 0 % de cuello de botella en CPU.

## Requisitos de hardware

- VRAM estimada: ~4,15 GB residentes en VRAM (`resident.bin`) más espacio para cachés y activaciones; el resto de pesos se transmite desde DRAM del host.
- RAM del sistema: 32-64 GB de DDR5 recomendados para alojar `experts.bin` (~23,42 GB) y la tabla PLE (~26,82 GB) mapeada zero-copy.
- GPU recomendada según la model card: GeForce RTX 5060 Ti de 16 GB. No se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo de 16 GB según el autor; no se especifican requisitos para GPUs de menor VRAM.
- Opciones de despliegue: runtime MinnieTheMoEcher (`./moecher -m models/qwen3.8_flash_next/moecher_manifest.json --port 8001`) y descarga vía `scripts/download_model.py --model qwen_flash_next`. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: ~113 tok/s prefill y ~20,5 tok/s decode en la configuración indicada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks ni especificaciones verificables de modelos alternativos de la misma categoría, y el empaquetado propietario dificulta una comparación directa con otros MoE multimodales.

## Limitaciones y advertencias

- Discrepancia de parámetros: el dato real de safetensors (448.931.056) no concuerda con la descripción de la model card de un MoE con 256 expertos por capa; conviene verificar antes de cualquier uso en producción.
- Formato propietario: los pesos principales son `resident.bin` y `experts.bin` con manifiesto JSON, no safetensors estándar; solo el PLE y el proyector de visión están en GGUF. La portabilidad a otros runtimes no está garantizada.
- Dependencia del runtime MinnieTheMoEcher, mantenido por el propio autor del paquete.
- Idiomas limitados a inglés y chino; no se declara soporte de castellano.
- Longitud de contexto no documentada, lo que impide planificar cargas de contexto largo.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en la información disponible.
- Sin descargas ni valoraciones en Hugging Face en el momento de la consulta, lo que reduce la evidencia externa sobre su calidad.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de auditoría independiente aconseja validación propia antes de desplegar.
- El proceso de cuantización agresiva en expertos (`IQ1_M` a `IQ4_XS`) puede degradar la calidad frente al modelo base; no se aportan métricas de degradación.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/TinoBruno/moecher-qwen-3.8-flash-next
- Runtime MinnieTheMoEcher: https://github.com/tinobruno/MinnieTheMoEcher
