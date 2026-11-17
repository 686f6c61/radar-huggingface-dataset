# yniw/MiniMax-H3-mmh3

## Resumen
MiniMax-H3-mmh3 es un repositorio de artefactos derivados de MiniMax H3, un modelo de generación de vídeo a partir de texto, empaquetados para el motor de inferencia mmh3. Lo publica el usuario yniw y no contiene pesos completos del modelo base, sino parches, LoRAs y un VAE cuantizado que modifican checkpoints de terceros (Comfy-Org, FastVideo, TaoLiveAIGC, pdmd2026 y ZhengmingYu) para que funcionen con el motor mmh3 y, en varios casos, también con ComfyUI.

El interés del repositorio está en la compresión del coste de inferencia: incluye un parche que convierte el DiT INT8 podado en la variante FastH3 VSA-DataFree, que genera en cuatro pasos con atención dispersa sobre vídeo; un VAE de vídeo con capas lineales en INT8 ConvRot; y tres LoRAs de destilación que reducen la generación a dos, tres o cuatro pasos. El resultado es un conjunto de piezas que permite ejecutar MiniMax H3 con muy pocos pasos de muestreo y precisión reducida, algo relevante para despliegues con presupuesto de GPU ajustado.

El repositorio ocupa 10,5 GB y se distribuye bajo la licencia comunitaria de MiniMax H3, no bajo una licencia de código abierto permisiva. No se publican especificaciones del modelo base (parámetros, contexto, idiomas) en la información disponible, por lo que muchos campos de esta ficha quedan como no disponibles.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | no disponible para el modelo base; los artefactos operan sobre un DiT (diffusion transformer) con VAE de vídeo y atención dispersa (VSA) en la variante FastH3 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 ConvRot en el DiT podado y en las capas lineales del decodificador del VAE; LoRAs en BF16; precisión de atención int8-fp8 en la inferencia |
| Idiomas soportados | no disponible (los prompts de texto dependen del modelo base) |
| Licencia | minimax-h3-community-license-agreement (etiquetada como "other") |
| Formato de pesos | safetensors (parche LoRA rank-64 con tensores adicionales, VAE INT8, LoRAs BF16 rank-128) |

## Arquitectura y entrenamiento
Los artefactos se apoyan en MiniMax H3, cuyo diseño interno no se detalla en la información disponible; lo que sí se documenta es la cadena de derivaciones. El parche `minimax_h3_fasth3_vsa_datafree_patch_rank64.safetensors` transforma el DiT INT8 ConvRot podado de Comfy-Org en el checkpoint FastH3 VSA-DataFree de FastVideo: las diferencias entre ambos conjuntos de pesos se reducen a una LoRA de rango 64 y los tensores que una LoRA no puede transportar (compuertas VSA y AdaLN ajustado) se convierten al layout del DiT INT8 podado. Se construyó con `tools/models/fasth3_vsa_patch.py` de mmh3.

Las tres LoRAs de destilación siguen un patrón similar de re-factorización y renombrado. TaoMate-H3 (rango 128, EMA del paso 3000) genera en tres pasos con el schedule `taomate` (estados 0, 16, 33 y 49 de 50); PDMD 2-NFE (estudiante del paso 4000, destilado con Projected Distribution Matching Distillation) genera en dos pasos con shifts de vídeo y audio de 12 y 3, y sus actualizaciones q, k y v se fusionan y recortan de rango 384 a 128 conservando el 97 % de su energía media; DMAD (estudiante de 4 pasos con crítico entrenado por Distribution Matching as Adversarial Distillation) usa shifts 12 y 2 y una regla de re-ruido específica. El VAE INT8 se cuantizó con GPTQ sobre latentes de calibración, con reescalado por canal de entrada plegado en los pesos vecinos, y alcanza 60,9 dB PSNR frente al VAE FP16 en cinco latentes FastH3 fuera de calibración (58,2 dB con redondeo al más cercano).

## Capacidades
- Generación de vídeo a partir de texto (pipeline `text-to-video`), con generación de audio asociada según los shifts de audio documentados en las LoRAs.
- Generación en pocos pasos: 2 pasos (PDMD), 3 pasos (TaoMate) o 4 pasos (FastH3 VSA y DMAD).
- Atención dispersa sobre vídeo (VSA) en la variante FastH3, con inicio de dispersión configurable.
- Precisión de atención reducida (int8-fp8) para abaratar la inferencia.
- Carga de LoRAs bajo los nombres de ComfyUI, lo que permite usar los adaptadores tanto en mmh3 como en ComfyUI.
- Decodificación de vídeo con VAE cuantizado en INT8 compatible con checkpoints INT8 ConvRot de ComfyUI.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingüe explícito.

## Casos de uso
- Prototipado rápido de vídeo generativo: con la LoRA PDMD de 2 pasos y atención int8-fp8 se puede iterar sobre prompts con un coste de muestreo mínimo, útil para explorar ideas antes de lanzar una generación de más calidad.
- Producción de clips cortos en pipelines automatizados: el parche FastH3 VSA-DataFree permite generar en cuatro pasos con atención dispersa, lo que encaja en procesos por lotes donde el throughput importa más que el detalle fino.
- Integración en ComfyUI: las LoRAs y el VAE están renombrados al esquema de ComfyUI, de modo que un estudio con flujos de trabajo en nodos puede incorporar los adaptadores sin conversión adicional.
- Reducción de huella de memoria en GPUs modestas: el VAE INT8 y el DiT INT8 ConvRot disminuyen los requisitos de VRAM frente a las variantes FP16, lo que facilita desplegar generación de vídeo en hardware de gama alta de consumo.
- Evaluación comparativa de métodos de destilación: al reunir TaoMate, PDMD y DMAD en un mismo repositorio con comandos reproducibles, sirve para medir en igualdad de condiciones la calidad de cada esquema de pocos pasos.
- Investigación sobre cuantización de VAEs: el PSNR reportado (60,9 dB frente a FP16) y el método GPTQ con reescalado por canal ofrecen un punto de partida para estudiar el impacto de la cuantización en la calidad visual.
- Despliegue con audio sincronizado: los shifts de audio diferenciados en PDMD y DMAD permiten ajustar el equilibrio entre vídeo y audio en la generación conjunta.

## Benchmarks y rendimiento
| Metrica | Resultado | Contexto |
|---|---|---|
| PSNR del VAE INT8 frente al VAE FP16 | 60,9 dB | Decodificación de cinco latentes FastH3 fuera de calibración |
| PSNR del VAE con redondeo al más cercano | 58,2 dB | Misma prueba, cuantización naive como referencia |
| Energía conservada en la LoRA PDMD tras recorte de rango | 97 % de media | Fusión de q, k y v y recorte de rango 384 a 128 |

No se han publicado resultados de benchmarks de calidad de vídeo (FVD, CLIP score u otros) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible con cifras concretas; el repositorio no publica requisitos. El uso de DiT INT8 ConvRot, VAE INT8 y atención int8-fp8 apunta a una reducción sustancial frente a FP16, pero no se cuantifica.
- GPU recomendadas: no disponible. Por el tamaño del repositorio (10,5 GB) y el uso de cuantización INT8, es plausible que quepa en GPUs de consumo de gama alta con suficiente VRAM, pero no hay confirmación en la información proporcionada.
- ¿Cabe en GPU de consumo? No confirmado; depende del tamaño real del DiT base, que no se especifica.
- Opciones de despliegue: motor mmh3 (comandos `mmh3 generate` documentados) y ComfyUI para las LoRAs y el VAE; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de difusión de vídeo.
- Latencia y throughput: no disponibles; solo se indica el número de pasos de muestreo (2, 3 o 4) según el adaptador.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-mmh3 (este repo) | no disponible | no disponible | Artefactos de destilación y cuantización para MiniMax H3 | Comunitaria MiniMax H3 | Hugging Face, 3462 descargas |
| MiniMaxAI/MiniMax-H3 | no disponible | no disponible | Modelo base de generación de vídeo | no disponible | Hugging Face |
| FastVideo/FastVideo-FastH3-4-step-Preview-v1-VSA-DataFree | no disponible | no disponible | Variante de 4 pasos con VSA | no disponible | Hugging Face |
| TaoLiveAIGC/TaoMate-H3 | no disponible | no disponible | Adaptador de destilación a 3 pasos | no disponible | Hugging Face |
| pdmd2026/pdmd_2NFE_lora | no disponible | no disponible | LoRA de destilación a 2 pasos | no disponible | Hugging Face |

La comparación con modelos de otras familias no es posible con los datos disponibles; los únicos puntos de referencia documentados son los propios checkpoints de origen de los que derivan estos artefactos.

## Limitaciones y advertencias
- El repositorio no contiene un modelo autónomo: son artefactos derivados que requieren el DiT base de Comfy-Org/MiniMax-H3 y el motor mmh3 para funcionar.
- El parche FastH3 incluye tensores que una LoRA convencional no puede transportar (compuertas VSA, AdaLN), por lo que herramientas distintas de mmh3 pueden no cargarlo correctamente.
- La licencia es la acordada comunitaria de MiniMax H3, no una licencia de código abierto; es obligatorio revisar sus términos antes de cualquier uso comercial.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas del modelo base en la información disponible.
- La generación en 2 o 3 pasos reduce la calidad potencial frente a schedules más largos; los benchmarks de calidad no se publican.
- La cuantización INT8 introduce una pérdida medible (60,9 dB PSNR frente a FP16), aceptable en muchos casos pero no idéntica al original.
- La información de la model card está truncada al final del apartado de DMAD, por lo que pueden faltar artefactos o detalles adicionales.
- No hay garantías de soporte ni mantenimiento del repositorio por parte del autor.

## Enlaces
- Repositorio en Hugging Face: https://huggingface.co/yniw/MiniMax-H3-mmh3
- Motor de inferencia mmh3: https://github.com/niw/mmh3
- Modelo base MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Checkpoints de Comfy-Org para MiniMax H3: https://huggingface.co/Comfy-Org/MiniMax-H3
- FastH3 VSA-DataFree: https://huggingface.co/FastVideo/FastVideo-FastH3-4-step-Preview-v1-VSA-DataFree
- TaoMate-H3: https://huggingface.co/TaoLiveAIGC/TaoMate-H3
- PDMD 2-NFE LoRA: https://huggingface.co/pdmd2026/pdmd_2NFE_lora
- DMAD: https://huggingface.co/ZhengmingYu/DMAD
