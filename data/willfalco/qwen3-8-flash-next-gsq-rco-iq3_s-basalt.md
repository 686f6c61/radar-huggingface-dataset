# willfalco/Qwen3.8-Flash-Next-GSQ-RCO-IQ3_S-Basalt

## Resumen

Qwen3.8-Flash-Next GSQ-RCO IQ3_S for Basalt es un empaquetado en formato `.basalt` del modelo Qwen3.8-Flash-Next de Qwen, cuantizado por ISTA-DASLab con su esquema GSQ-RCO en tipo IQ3_S. El paquete lo publica el usuario willfalco y esta pensado exclusivamente para Basalt, un motor de inferencia local para GPUs NVIDIA Blackwell (sm_120) que mantiene en RAM del sistema los expertos que no caben en VRAM. No se trata de un modelo nuevo ni de un reentrenamiento: los 1.224 tensores del GGUF original se copian byte a byte, sin recuantizar.

El modelo base es un transformer de tipo mezcla de expertos (MoE) con capacidades multimodales de imagen-texto a texto, e incluye un cabezal MTP (multi-token prediction) que actua como drafter para decodificacion especulativa. El paquete anade ademas el proyector de vision en BF16 de ISTA-DASLab y los tensores MTP en BF16 procedentes del checkpoint original de Qwen, junto con el vocabulario de borrador del pack oficial de Basalt. El resultado es un unico fichero de 87,6 GB que integra pesos, drafter y vision en un solo artefacto listo para servir.

Su relevancia es practica: permite ejecutar un modelo MoE grande y multimodal en hardware de consumo Blackwell (RTX 50 y RTX PRO) repartiendo los expertos entre VRAM y RAM paginada. El autor reporta velocidades de 117 a 140 tok/s en prosa con una sola peticion y hasta 260-330 tok/s cuando la respuesta repite contexto, sobre dos RTX 5070 Ti de 16 GB. La licencia de los pesos es Qwen Community License 1.0, con restricciones para servicios gestionados y empresas de gran volumen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con cabezal MTP y proyector de vision (image-text-to-text) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 256K tokens (configurado en el compose de Basalt) |
| Tipos de cuantizacion | IQ3_S (GSQ-RCO de ISTA-DASLab); MTP y proyector de vision en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (pesos); GGUF de origen Apache-2.0; Basalt MIT |
| Formato de pesos | `.basalt` (un unico fichero de 87,6 GB; origen GGUF IQ3_S) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer de mezcla de expertos (MoE) multimodal, segun indican las etiquetas del repositorio (`moe`, `mtp`, `image-text-to-text`). El paquete incorpora tres componentes: los pesos del modelo (expertos enrutados, tabla de n-gramas y pesos densos) copiados del GGUF IQ3_S de ISTA-DASLab; un drafter MTP en BF16 con la parte densa auto-destilada y el vocabulario de borrador del pack `Qwen3.8-FN-UD-IQ3_XXS` de Basalt; y el proyector de vision `mmproj-Qwen3.8-Flash-Next-BF16.gguf` de ISTA-DASLab. El GGUF original no incluye cabezal MTP, por lo que este se toma del checkpoint de Qwen (revision `de4b8e4d`).

La innovacion tecnica del empaquetado es la integracion de decodificacion especulativa mediante el cabezal MTP y el reparto de expertos entre VRAM y RAM del sistema (50,4 GB de expertos quedan en RAM paginada). El proceso de conversion usa el conversor de Basalt v0.5.0; su modo `--verify` confirmo que todos los tensores del GGUF eran byte-identicos y que los checksums de cada seccion eran correctos. Las 29 advertencias sobre tensores `mtp/dense` son esperadas, ya que provienen del checkpoint de Qwen y no del GGUF. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las fases de RLHF/DPO del modelo base.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno con contexto de hasta 256K tokens.
- Entrada multimodal de imagen y video (pipeline `image-text-to-text`, con FFmpeg 6 anadido para video).
- Decodificacion especulativa mediante cabezal MTP, con aceleracion notable en respuestas que repiten contexto.
- Servicio compatible con las APIs de OpenAI y Anthropic a traves del servidor de Basalt (modelo expuesto como `mod0`).
- Soporte de KV cache en int8 y hasta 2 peticiones concurrentes, cada una con acceso a la ventana completa de 256K.
- Muestreo por defecto: temperatura 1.0, top_p 0.95, top_k 20 cuando la peticion no especifica parametros.
- Soporte de API key opcional (`--api-key=KEY`) para restringir el acceso al servidor.
- Capacidades de tool calling, agentes y multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local de contexto largo: con 256K tokens de ventana y KV cache int8, permite mantener conversaciones extensas o analizar documentos completos sin truncar, en hardware de consumo Blackwell.
- Analisis de imagenes y video en local: el proyector de vision BF16 y la integracion de FFmpeg permiten procesar fotogramas y clips sin enviar datos a la nube, adecuado para entornos con requisitos de privacidad.
- Generacion de texto de alta velocidad en estacion de trabajo: los 117-140 tok/s en prosa con una RTX 5070 Ti y hasta 330 tok/s en respuestas repetitivas lo hacen viable para redaccion asistida interactiva.
- Servicio interno con API compatible OpenAI/Anthropic: el servidor de Basalt expone ambos formatos en el puerto 8080, lo que facilita integrarlo en herramientas existentes sin cambiar clientes.
- Procesamiento por lotes de dos peticiones concurrentes: el compose permite 2 solicitudes simultaneas con unos 190 tok/s agregados, util para pipelines de resumen o clasificacion de documentos.
- Despliegue en hardware de consumo con expertos en RAM: con dos RTX 5070 Ti de 16 GB y 60 GB de RAM libre se ejecuta un MoE que de otro modo requeriria GPUs de centro de datos, apropiado para laboratorios y equipos pequenos.
- Evaluacion y experimentacion con cuantizaciones: al conservar los tensores IQ3_S sin recuantizar y verificar byte a byte, sirve como referencia reproducible para comparar motores de inferencia y esquemas de cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta mediciones de velocidad de inferencia leidas del log del servidor durante uso ordinario, no como benchmark formal:

| Metrica | Valor |
|---|---|
| Una peticion, prosa | 117-140 tok/s |
| Una peticion con respuesta que repite contexto | 260-330 tok/s |
| Dos peticiones simultaneas | ~190 tok/s en total |
| Lectura de prompt | 2.090 tok/s a 8K tokens; 4.456 tok/s a 35K tokens |
| Carga de pesos | 52 GiB en 21 s |

Hardware de medida: 2x RTX 5070 Ti 16 GB (PCIe 4.0 x8 cada una), Ryzen 9 3950X (AVX2, sin AVX-512), 128 GB DDR4.

## Requisitos de hardware

- GPU NVIDIA Blackwell (sm_120) obligatoria: RTX 50 series o RTX PRO. No funciona en arquitecturas anteriores.
- Driver R580 o superior, NVIDIA Container Toolkit y Linux x86-64 con AVX2.
- VRAM: el compose de referencia usa 2 GPUs de 16 GB (la primera ejecuta todas las capas, la segunda aloja y computa expertos). Tambien admite una sola GPU con `--gpu=0`.
- RAM del sistema: unos 60 GB libres; los expertos que no caben en VRAM (50,4 GB) se mantienen en RAM paginada.
- Almacenamiento: fichero de 87,6 GB, mas espacio para la imagen de Docker y la compilacion de Basalt.
- Despliegue: Basalt v0.5.0 (compilado desde su tag de git en el primer arranque, 10-20 minutos con FFmpeg 6). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: ver tabla de la seccion anterior, medida en el hardware indicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next GSQ-RCO IQ3_S (Basalt) | no disponible (MoE) | 256K | `.basalt` | Qwen Community 1.0 | HF (willfalco) |
| Qwen3.8-Flash-Next GSQ-RCO GGUF (ISTA-DASLab) | no disponible (MoE) | no disponible | GGUF IQ3_S | Apache-2.0 (GGUF) | HF (ISTA-DASLab) |
| Qwen3.8-Flash-Next Basalt (pack oficial) | no disponible (MoE) | no disponible | `.basalt` (NVFP4 / UD-IQ3_XXS) | Qwen Community 1.0 | HF (jesdga) |
| Qwen3.8-Flash-Next (original) | no disponible (MoE) | no disponible | safetensors / BF16 | Qwen Community 1.0 | HF (Qwen) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia de hardware muy especifica: requiere GPU NVIDIA Blackwell (sm_120), driver R580+, Linux x86-64 con AVX2 y NVIDIA Container Toolkit. No es portable a otras plataformas.
- Consumo de RAM elevado: aproximadamente 60 GB libres necesarios para mantener los expertos fuera de VRAM.
- El servidor de Basalt solo acepta el nombre de modelo `mod0`; rechaza cualquier otro identificador.
- Sin API key por defecto; hay que anadir `--api-key=KEY` manualmente para restringir el acceso.
- El primer arranque compila Basalt desde el codigo fuente (10-20 minutos), lo que complica despliegues automatizados y reproducibles.
- Licencia Qwen Community 1.0: permite uso, redistribucion y obras derivadas con aviso de licencia; los productos con mas de 100 millones de usuarios activos mensuales o 20 millones de USD de ingresos mensuales deben mostrar el nombre del modelo, y las empresas que ofrezcan Model-as-a-Service o asistentes de trabajo con IA necesitan una licencia separada de Qwen.
- El GGUF de origen es Apache-2.0, pero el paquete `.basalt` redistribuye esos tensores bajo la licencia Qwen Community 1.0; conviene revisar ambas antes de uso comercial.
- No hay informacion sobre sesgos, tasa de alucinacion ni cobertura idiomatica del modelo base en la documentacion disponible.
- El paquete no ha sido validado con benchmarks de calidad; las unicas metricas publicadas son de velocidad en un equipo concreto.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion por terceros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/willfalco/Qwen3.8-Flash-Next-GSQ-RCO-IQ3_S-Basalt
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Cuantizacion GSQ-RCO de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Basalt (motor de inferencia): https://github.com/jesdga95/basalt
- Packs oficiales de Basalt: https://huggingface.co/jesdga/Qwen3.8-Flash-Next-Basalt
- Strata (motor del que deriva Basalt): https://github.com/Niko1221/Strata
- Infernix (kernels adaptados): https://github.com/Wallawalla47/Infernix
- ggml / llama.cpp (formato GGUF): https://github.com/ggml-org/llama.cpp
- NInfer (ideas base de Basalt): https://github.com/Neroued/ninfer
