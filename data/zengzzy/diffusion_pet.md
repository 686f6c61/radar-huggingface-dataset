# zengzzy/diffusion_pet

## Resumen

diffusion_pet v18 es un prior de difusión condicionado por geometría para la generación de mechones de pelo animal (fur strands). Lo desarrolla el usuario zengzzy y se publica como pesos de PyTorch acompañados de un repositorio de código en GitHub. El modelo no es un modelo de lenguaje: resuelve un problema de reconstrucción 3D y síntesis de geometría fina, concretamente muestrear la forma de los mechones de pelo que crecen en cada parche de la superficie de un cuerpo animal, dada una dirección de flujo de pelo.

La arquitectura combina un fusionador multivista de características DINO (heredado de la versión v17) con una UNet de difusión (UNet18) que recibe como condición mapas de altura, mapas de normales y la dirección "up" en el marco local del parche, inyectados mediante una capa de entrada inicializada a cero. El entrenamiento es completamente sintético: cuerpos de perros aleatorios del espacio de formas SMAL y mechones generados proceduralmente, renderizados desde 58 cámaras.

Es relevante para investigadores en gráficos por computador y reconstrucción de animales, ya que demuestra que un prior de difusión condicionado por geometría local supera tanto a un prior de parches planos (v17) como a la generación procedural con los mismos parámetros, reduciendo el error de forma de 0,430 a 0,163 y el error de orientación (yaw) de 54° a 11° en el conjunto de test sintético.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | UNet de difusión (UNet18) con fusionador multivista DINO y condicionamiento geométrico por capa de entrada zero-init |
| Parámetros totales | no disponible (pesos: 80 MB UNet + 35 MB fuser) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusión geométrica, no de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (no es un modelo lingüístico) |
| Licencia | no decidida ("Not yet decided") |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

El modelo se estructura en dos etapas. La etapa A es un fusionador multivista (v17 fuser, 35 MB) que combina características DINO de múltiples vistas de cada parche de superficie y produce cabezas de parámetros. La etapa B/C es una UNet de difusión (UNet18, 80 MB, pesos EMA) que muestrea las formas de mechón condicionadas por las características de imagen fusionadas y por la geometría local del parche: mapa de altura por texel, mapa de normales y dirección "up" del mundo, todo en el marco del parche. La condición geométrica se introduce mediante una capa de entrada inicializada a cero, de modo que el modelo parte de un comportamiento equivalente a v17 y aprende a incorporar la geometría durante el entrenamiento.

El entrenamiento es enteramente sintético. Los cuerpos son perros aleatorios del espacio de formas público SMAL (39 perros), sin parámetros ajustados de animales reales. Los mechones se generan proceduralmente y se renderizan desde 58 cámaras. El split de entrenamiento (incluyendo validación) cubre cuerpos 0–89, 135 perros y 8.640 parches; la validación usa `body % 10 == 7` con 576 parches; el test usa cuerpos 90–99, 20 perros y 1.280 parches. El checkpoint publicado corresponde al paso 16.000 de la etapa C. El modelo base v17 se entrenó con parches de pelo planos generados proceduralmente; v18 se inicializa desde v17 r4b.

## Capacidades

- Muestreo de formas de mechón de pelo condicionadas por dirección de flujo de pelo, incluyendo cómo el pelo se levanta, cae y se agrupa.
- Condicionamiento por características de imagen multivista (DINO) fusionadas por el fuser v17.
- Condicionamiento por geometría local de la piel: mapa de altura, mapa de normales y dirección "up" en el marco del parche.
- Generación de múltiples propuestas de mechón por parche (inferencia vía `infer_v18_surfpack_proposals.py`).
- Reconstrucción 3D de pelo animal a partir de parches de superficie.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo "thinking", visión general, audio ni otras capacidades multimodales fuera del pipeline específico de fur.

## Casos de uso

- Reconstrucción de pelo animal en pipelines de gráficos por computador: dado un cuerpo 3D segmentado en parches con mapas de altura y normales, el modelo genera las formas de mechón que crecen en cada parche, sustituyendo la generación procedural manual.
- Síntesis de groom sintético para entrenamiento de otros modelos: al generar mechones realistas sobre cuerpos SMAL, se pueden producir datasets sintéticos etiquetados para tareas de reconstrucción o segmentación de pelo.
- Investigación en priors de difusión geométricos: el modelo sirve como referencia reproducible para estudiar cómo el condicionamiento por geometría local mejora la difusión en dominios de geometría fina.
- Prototipado de assets para videojuegos y animación: generación de mechones de pelo animal sobre mallas base, con control de la dirección de flujo, para iterar sobre looks de criaturas.
- Evaluación comparativa de métodos de reconstrucción de fur: el checkpoint y el conjunto de test sintético permiten medir error de forma y yaw frente a generación procedural.
- Reproducción de resultados académicos: el repositorio incluye scripts de inferencia (`apply_v18.sh`) y entrenamiento (`train_v18.sh`), lo que facilita replicar las cifras publicadas.

## Benchmarks y rendimiento

Resultados sobre cuerpos de test sintéticos no vistos (medianas por parche sobre 1.280 parches). La métrica de forma es el error de punto remuestreado dividido por la longitud de arco (menor es mejor); el yaw es el error de azimut en grados.

| Método | Forma ↓ | Yaw ↓ |
|---|---|---|
| v17 (prior de parches planos) | 0,430 | 54° |
| Crecimiento procedural, mismos parámetros | 0,220 | 16° |
| v18 sin geometría | 0,181 | 13° |
| **v18** | **0,163** | **11°** |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; los pesos suman aproximadamente 115 MB (80 MB UNet + 35 MB fuser), por lo que la huella de memoria es reducida y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no disponible; por el tamaño de los pesos, una GPU consumer (por ejemplo, RTX 3060 o superior) es suficiente, aunque no se especifican requisitos oficiales.
- Cabe en GPU consumer: sí, previsiblemente, dado el tamaño de los checkpoints; no se confirma oficialmente.
- Opciones de despliegue: inferencia vía `diag/v17/infer_v18_surfpack_proposals.py` con `--geo_dir v18 --model v18/v18_best.pt`, o mediante `scripts/apply_v18.sh`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Forma ↓ | Yaw ↓ | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diffusion_pet v18 | Difusión geométrica para fur | 0,163 | 11° | No decidida | Pesos en Hugging Face |
| diffusion_pet v17 | Prior de parches planos | 0,430 | 54° | No decidida | Pesos en Hugging Face (inicialización) |
| Crecimiento procedural | Generación procedural | 0,220 | 16° | No aplica | Referencia en la model card |

No se dispone de comparación con otros modelos públicos de reconstrucción de fur en la información proporcionada.

## Limitaciones y advertencias

- Entrenamiento exclusivamente sintético: los cuerpos provienen del espacio de formas SMAL y los mechones son procedurales; no se usan parámetros ajustados de animales reales, por lo que la generalización a pelo real no está validada en la información disponible.
- Evaluación limitada a cuerpos de test sintéticos (cuerpos 90–99, 20 perros, 1.280 parches); no hay resultados en datos reales.
- Licencia no decidida ("Not yet decided"): no se puede asumir uso comercial permitido; es un riesgo legal para producción.
- Modelo de nicho: no es un modelo de lenguaje ni multimodal general; no sirve para texto, código, razonamiento ni tareas fuera del pipeline de fur.
- Dependencia del pipeline de código del repositorio GitHub para la inferencia y el preprocesado (mapas de altura, normales, features DINO); los pesos por sí solos no son autónomos.
- Riesgo de sobreajuste al dominio sintético SMAL y a la configuración de 58 cámaras; el comportamiento con otras cámaras o topologías no está documentado.
- No se documentan sesgos, pero al ser un modelo geométrico específico de perros, su aplicabilidad a otras especies no está garantizada.

## Enlaces

- Hugging Face: https://huggingface.co/zengzzy/diffusion_pet
- Repositorio de código, generador de datos e instrucciones: https://github.com/CCdydy/diffusion_pet
- Checksums: `SHA256SUMS` en el repositorio de Hugging Face
- Scripts de inferencia y entrenamiento: `scripts/apply_v18.sh`, `scripts/train_v18.sh`, `diag/v17/infer_v18_surfpack_proposals.py` (en el repositorio GitHub)
