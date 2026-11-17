# zwc2003/tmp-2

## Resumen

`zwc2003/tmp-2` es un repositorio de Hugging Face que no contiene un modelo entrenado con pesos publicados de forma convencional, sino un espejo de migración de un proyecto de investigación interno denominado `nuReasoning`. El autor, `zwc2003` (usuario de GitHub `wczheng`), lo emplea para trasladar a un nuevo clúster los datos de entrenamiento, los resultados de evaluación y los checkpoints de un pipeline de conducción autónoma y razonamiento multimodal. El repositorio ocupa 738,5 GB y está organizado por rutas que replican la estructura del directorio raíz original (`/cephfs/zhengwc/nuReasoning`).

El contenido incluye conjuntos SFT con imágenes de cámaras de vehículo (resolución típica 546×359), anotaciones, mapas, estados del ego, datos de RL y checkpoints de varios modelos: `alpamayo-1.5-10B` (un modelo de 10B parámetros), `Qwen3.5-0.8B` y un modelo denominado `WOD-SFT1186`. La model card está redactada en chino y describe exclusivamente el procedimiento de descarga y restauración, no las características del modelo.

No se trata, por tanto, de un modelo listo para usar en producción: no hay pipeline declarado, no hay licencia, no hay idiomas especificados y no se publican benchmarks ni especificaciones de arquitectura. Cualquier evaluación técnica debe hacerse a partir de los checkpoints incluidos, que requieren el código privado del repositorio GitHub `wczheng/nuReasoning` para poder ejecutarse.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible (el repo contiene checkpoints de modelos de 0.8B y 10B, entre otros) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (se distribuyen pesos sin cuantizar; solo se mencionan archivos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (según tags del repo); el resto de artefactos son archivos `.tar` de datos y resultados |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura de ningún modelo concreto. El repositorio es un contenedor de artefactos de un pipeline de investigación en conducción autónoma, con datos multimodales (imágenes de cámaras, mapas, `ego_state`, anotaciones y razonamiento en formato texto). Los nombres de los directorios sugieren varias líneas de trabajo: SFT sobre imágenes de devkit, planificación con 0,8B parámetros y configuraciones de 8 cámaras, variantes con historial de baja resolución (`lowhist`), modos de razonamiento (`reasoning_modes`) y datos de validación (`planning_val_full`).

Los checkpoints de mayor tamaño corresponden a `alpamayo-1.5-10B` (10B parámetros), con variantes de RL, VQA y "AD Knowledge". También se incluyen adaptadores LoRA de primera ronda y un baseline de planificación sobre `Qwen3.5-0.8B`. No se especifican número de tokens de entrenamiento, composición del dataset, ni si se aplicaron RLHF o DPO. La model card menciona que parte de los datos SFT no se puede reconstruir byte a byte y que el CoT del profesor requiere acceso a una API, lo que indica destilación de razonamiento desde un modelo externo.

## Capacidades

- Generación de texto y razonamiento multimodal sobre imágenes de cámaras de vehículo, a partir de los conjuntos SFT y VQA incluidos.
- Planificación de trayectorias en entornos de conducción (los directorios `planning_*` contienen datos y checkpoints específicos).
- Respuesta a preguntas visuales (VQA) sobre escenas de conducción, con datos de evaluación en `vqa_review/`.
- Razonamiento multi-paso en modo "reasoning" (conjunto `reasoning_modes_val_extra`).
- Procesamiento de múltiples cámaras (hasta 8 cámaras en las variantes `cams8`).
- No hay evidencia de soporte de tool calling, function calling ni capacidades de audio.
- No se declaran capacidades multilingües; los datos y la documentación están en chino e inglés técnico.

## Casos de uso

- Investigación en conducción autónoma: el repositorio permite reproducir el pipeline de planificación y evaluación sobre el devkit, con 1.000 clips de test incluidos en `data/test_inputs/`.
- Reproducción de experimentos de SFT multimodal: los conjuntos `sft-*.tar` y `sft_v3_extra` permiten reentrenar o hacer fine-tuning sobre imágenes de cámaras con anotaciones y razonamiento.
- Evaluación de modelos de razonamiento visual: los datos de `reasoning_modes_val_extra` y `vqa_v32_extra` sirven para medir la calidad del razonamiento sobre escenas de tráfico.
- Benchmarking de planificación con múltiples cámaras: las variantes `planning_08b_cams8_extra` y `lowhist` permiten comparar configuraciones de entrada (8 cámaras vs. historial de baja resolución).
- Estudio de destilación de CoT: el repositorio documenta que el CoT del profesor requiere API, lo que lo hace útil para analizar la dependencia de datos sintéticos en pipelines de razonamiento.
- Migración y replicación de entornos de investigación: el script `restore.sh` y `verify_restore.py` permiten reconstruir un clúster de entrenamiento con verificación de integridad por número de archivos y bytes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Almacenamiento: 738,5 GB para el repositorio completo; se recomienda espacio adicional para el descomprimido de los `.tar` (la model card sugiere borrar `data/` y `results/` tras verificar).
- VRAM para inferencia: no disponible. Los checkpoints de 10B requieren al menos 20 GB en FP16, pero no se especifica el formato de despliegue.
- GPU recomendadas: no disponible. Los nombres de servidores mencionados (H200) sugieren entrenamiento en GPU de centro de datos.
- GPU de consumo: no confirmado; un modelo de 10B en FP16 no cabe en GPUs de 24 GB sin cuantización, y no se distribuyen versiones GGUF.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI. El código de inferencia está en un repositorio GitHub privado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. El repositorio no se presenta como un modelo publicable, sino como un espejo de artefactos de un proyecto interno, por lo que no existe una comparación directa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de licencia: no se concede permiso explícito de uso comercial ni de redistribución; el uso por defecto queda restringido por derechos de autor.
- Dependencia de código privado: sin acceso al repositorio `wczheng/nuReasoning` los checkpoints no son utilizables de forma directa.
- Repositorio incompleto por diseño: faltan las imágenes completas de todas las cámaras (aproximadamente 1,1 TB), los estados del optimizador, experimentos descartados y el entorno conda.
- Datos SFT parcialmente irreproducibles: la model card indica que algunos conjuntos no se pueden reconstruir byte a byte y que el CoT del profesor requiere una API externa.
- Riesgo de alucinación: no evaluado; no hay benchmarks ni métricas publicadas.
- Sesgos: no documentados; los datos provienen de un devkit de conducción concreto, con posible sesgo geográfico y de condiciones de captura.
- Idiomas: no declarados; la documentación y los datos están orientados a chino e inglés técnico.
- Advertencia de producción: no apto para uso en producción sin una evaluación independiente, dada la falta de especificaciones, licencia y métricas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zwc2003/tmp-2
- Repositorio GitHub del proyecto (privado, referenciado en la model card): https://github.com/wczheng/nuReasoning
- Documentación de restauración (referenciada): `docs/new-cluster-setup.md` dentro del repositorio GitHub
