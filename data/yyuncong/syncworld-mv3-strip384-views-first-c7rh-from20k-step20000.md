# yyuncong/SyncWorld-mv3-strip384-views-first-c7rh-from20k-step20000

## Resumen

SyncWorld-mv3-strip384-views-first-c7rh-from20k-step20000 es un checkpoint final de un modelo del mundo (world model) para robótica desarrollado por el usuario yyuncong, orientado a la predicción de dinámica futura (forward dynamics) en entornos manipulativos multi-cámara. El modelo genera los 16 fotogramas siguientes a un ancla visual y sus 16 acciones futuras, condicionado por fragmentos de vídeo y acción recuperados de una biblioteca (retrieval in-context) que actúan como contexto limpio dentro de la misma ventana de atención. Forma parte de una familia de iteraciones encadenadas (mvSV2, mvSV3p, mvSV3h) sobre la receta C7RH de PEWM.

La relevancia técnica reside en su mecanismo de recuperación multimodal: selecciona fragmentos de la biblioteca combinando distancia de trayectoria del efector final, pose inicial, apariencia DINOv2-base de las cámaras mostradas y un filtro geométrico de "views first" a 10 grados y 10 cm que garantiza consistencia de punto de vista entre la consulta y el fragmento recuperado. Esto evita celdas negras o vistas desalineadas en el strip de tres cámaras.

El checkpoint se publica como pesos finales (update 20000 de 20000) bajo licencia OpenMDW-1.1, con un tamaño de repositorio de 30,3 GB. No se han publicado resultados de benchmarks ni métricas cuantitativas de rendimiento en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de atención completa (full-attention) con condicionamiento in-context por retrieval; sin memoria TTT |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventana de atención compuesta por 1 ancla + 16 acciones futuras + K fragmentos observados (K uniforme en 1..8); longitud en tokens no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de vídeo/acción, no lingüístico) |
| Licencia | OpenMDW-1.1 (license: other) |
| Formato de pesos | no disponible (repo de 30,3 GB; pesos del framework Cosmos) |

## Arquitectura y entrenamiento

El modelo emplea un transformer de atención completa sobre secuencias multimodales de vídeo y acción. Cada flujo de entrada es un strip de 1536x384 píxeles compuesto por tres celdas de 512x384 (4:3): las dos cámaras en tercera persona, barajadas entre las dos primeras celdas por stream, y la cámara de muñeca en la última. Se aplica dropout de vista por stream (una cámara al 10 %, dos al 5 %) y recortes verticales aleatorios en las cámaras de 512x512 (tercera persona 0,3-0,65; muñeca 0,5-1,0); las cámaras DROID de 910x512 se recortan al centro a 4:3. Un único plan de tiling por stream se mantiene para la consulta, sus propios chunks y cada chunk de la biblioteca.

El condicionamiento se construye mediante recuperación: K chunks observados de vídeo/acción (K uniforme en 1..8, un K por update para todas las GPUs) se colocan en la misma ventana de atención que la consulta, cada uno con un embedding aprendido de su distancia al ancla (8 buckets log2 desde 16 fotogramas, una fila para otras grabaciones y un vector de misma escena para hermanos). La distancia combina 3 x acción (trayectoria del efector final relativa al inicio de cada chunk, en el marco de la cámara, con estados del gripper paso a paso), pose inicial, apariencia DINOv2-base de las celdas en tercera persona mostradas y apariencia de la celda de muñeca con peso 1. Los slots se rellenan en orden: chunk adyacente, hasta min(2, K-2) slots de escena y slots de experiencia (máximo 64 chunks por grabación). El filtro "views first" exige que el chunk de biblioteca entre por la cámara de la consulta a menos de 10 grados de rotación y 10 cm de posición, y que su grabación cubra también la otra cámara mostrada dentro del mismo límite. Los chunks recuperados se leen con stride 2 sobre las 32 transiciones que terminan en su final.

El entrenamiento parte de los pesos de mvSV2 en el update 20000 y sigue la receta de mvSV3p cambiando solo la tabla de ventanas y las claves de acción: mezcla C7RH+ (ventanas DROID de C7RH y ventanas sim s7 a las cuotas de C7RH x 0,8, más RLBench y DROID sin etiquetar al 0,10 cada una) con filas de acción híbridas de C7RH. Las filas de acción futuras llevan la predicción de movimiento libre de un modelo de respuesta congelado F donde existen comandos (sim y DROID etiquetado); las consultas de RLBench y DROID sin etiquetar (20 % de los streams) conservan sus filas realizadas. No se especifica el número total de tokens de entrenamiento.

## Capacidades

- Generación de vídeo futuro: produce los 16 fotogramas siguientes a un ancla visual a partir de un strip de tres cámaras.
- Predicción de acciones futuras: genera 16 acciones futuras (trayectoria del efector final y estados del gripper) alineadas con los fotogramas predichos.
- Razonamiento in-context por recuperación: selecciona y condiciona sobre fragmentos de vídeo/acción de una biblioteca según distancia multimodal.
- Coherencia multi-vista: mantiene consistencia geométrica entre las cámaras en tercera persona y la de muñeca mediante el filtro de 10 grados / 10 cm.
- Manejo de dropout de vista: tolera la ausencia de una o dos cámaras manteniendo las celdas ausentes en negro de forma consistente.
- Recuperación de hermanos de episodio: los rollouts de robocasa y RLBench y su experto pueden recuperarse mutuamente mientras comparten trayectoria.
- No dispone de capacidades lingüísticas, de tool calling ni de agentes conversacionales; es un modelo específico de robótica.

## Casos de uso

- Predicción de dinámica para planificación en manipulación: el modelo genera los 16 fotogramas y acciones futuras dado un estado visual, lo que permite evaluar candidatos de plan antes de ejecutarlos en el robot real.
- Aumento de datos sintéticos para entrenamiento de políticas: al generar rollouts plausibles condicionados por fragmentos recuperados, se pueden ampliar conjuntos de demostraciones escasas en tareas de robocasa o RLBench.
- Evaluación de políticas en simulación: sirve como modelo del entorno para medir el éxito de una política sin ejecutar el simulador completo, usando la recuperación in-context para condicionar en trayectorias expertas.
- Aprendizaje por imitación con contexto recuperado: las filas de acción híbridas permiten entrenar políticas que imitan comandos convertidos por el modelo F, útil en pipelines de DROID etiquetado.
- Investigación en world models multi-cámara: su diseño de strips de tres vistas y filtro geométrico lo hace adecuado para estudiar consistencia de punto de vista en predicción de vídeo.
- Generación de trayectorias condicionadas por escena: la recuperación por apariencia DINOv2 y pose permite generar movimientos coherentes con la escena mostrada, útil para data augmentation en entornos con pocas demostraciones.
- Análisis de transferencia sim-a-real: la mezcla C7RH+ con ventanas sim y reales permite estudiar cómo el modelo generaliza entre dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 30,3 GB, lo que sugiere que los pesos en precisión completa no caben en GPUs de consumo sin cuantización.
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño del repo se requiere al menos una GPU con 40-80 GB (A100, H100) para pesos sin cuantizar.
- Cabe en consumer GPU: no disponible; probablemente no en configuraciones de 24 GB sin cuantización, pero no se confirma.
- Opciones de despliegue: el modelo se entrena en el framework Cosmos (cosmos-framework-dev) y usa recetas TOML propias; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SyncWorld-mv3-strip384-views-first-c7rh | no disponible | K chunks 1..8 + 16 acciones | no disponible | OpenMDW-1.1 | Hugging Face (este repo) |
| mvSV2 (yyuncong/SyncWorld-mv3-strip384-mvSV2-from40k-step20000) | no disponible | no disponible | no disponible | OpenMDW-1.1 | Hugging Face |
| mvSV3p (yyuncong/SyncWorld-mv3-strip384-views-first-s7pose-from20k-step20000) | no disponible | no disponible | no disponible | OpenMDW-1.1 | Hugging Face |

Las alternativas de la misma familia (mvSV2 y mvSV3p) comparten inicialización y método, diferenciándose en la mezcla de datos y las claves de acción. No se dispone de datos de benchmarks para comparar rendimiento entre ellas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse con mezclas de DROID, robocasa, RLBench y sim s7, puede heredar sesgos de esas distribuciones.
- Riesgo de alucinación: como modelo generativo de vídeo y acción, puede producir rollouts plausibles pero físicamente incorrectos; no se reportan métricas de fidelidad.
- Limitaciones de contexto: la recuperación falla en aproximadamente el 95 % de las consultas icgen con ambas cámaras mostradas (27 % de los streams), que no pueden recuperar ningún chunk de biblioteca y rellenan sus slots desde su propia grabación; solo el 6,8 % de icgen_rc y el 5,1 % de icgen_rm tienen una grabación de otro episodio que cubra ambas cámaras.
- Limitaciones de idioma: no aplica, es un modelo de vídeo/acción sin capacidades lingüísticas.
- Restricciones de licencia: OpenMDW-1.1 (license: other), enlazada a la licencia de NVIDIA Cosmos; debe revisarse antes de uso comercial.
- Caveats para producción: es un checkpoint de investigación con 0 descargas y 0 likes; no hay documentación de despliegue, latencia ni cuantización; el formato de pesos no se especifica y el pipeline declarado es robotics, no generación de texto.

## Enlaces

- Hugging Face: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-views-first-c7rh-from20k-step20000
- Modelo base mvSV2: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-mvSV2-from40k-step20000
- Modelo hermano mvSV3p: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-views-first-s7pose-from20k-step20000
- Licencia OpenMDW-1.1 (NVIDIA Cosmos): https://github.com/NVIDIA/Cosmos/blob/main/LICENSE
