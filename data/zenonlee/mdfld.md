# zenonlee/MDFLD

## Resumen

MDFLD v2 (multi-domain face landmark detection) es un modelo de deteccion de puntos faciales (face landmark detection) especializado en rostros de dominios no fotograficos: dibujos animados, caricaturas y animacion 3D, ademas de caras reales. Lo desarrolla un equipo academico (Yuanming Li, Gwantae Kim, Jeong-gi Kwak, Bon-hwa Ku y Hanseok Ko) y se publico junto al articulo "Towards Multi-Domain Face Landmark Detection with Synthetic Data from Diffusion Model" en ICASSP 2024. El modelo resuelve el problema de la degradacion de los detectores de landmarks entrenados con fotografia cuando se aplican a estilos artisticos con proporciones exageradas.

La version v2 que nos ocupa es el modelo del articulo afinado mediante self-training sobre rostros de dibujo animado y caricatura. Predice 68 puntos en orden iBUG 300-W y, ademas, el paquete que lo acompana anade curvas de parpado. En el conjunto de test de caricaturas CariFace (1.560 imagenes) reduce el NME de 68 puntos del 6,70 % al 5,03 %, y en fotogramas de video de caras reales no vistas alcanza el 1,74 % (frente al 3,03 % de la v1).

Es relevante para pipelines de animacion, captura de movimiento facial, avatares y postproduccion, donde los detectores genericos fallan. Su uso es exclusivamente de investigacion y los pesos se distribuyen como TorchScript, sin informacion publica sobre el numero de parametros ni sobre el coste de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal para regresion de keypoints (detalle no disponible; el codigo del repositorio se basa en STAR) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de 256 x 256 px) |
| Tipos de cuantizacion | no disponible (pesos TorchScript en precision original) |
| Idiomas soportados | no aplica (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | research-only (uso solo de investigacion, sin garantia) |
| Formato de pesos | TorchScript (`mdfld_cartoon_v2.torchscript.pt`); checkpoint original `.pkl` en la release v2.0 |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna mas alla de que el codigo del repositorio se apoya en STAR (un transformer para analisis de caras) y de que los pesos se exportan a TorchScript. La entrada es un recorte cuadrado de la cara de 256 x 256 px en formato BGR normalizado a [-1, 1] y la salida es un tensor de forma (N, 68, 2) con coordenadas en [-1, 1] que se reescalan a pixeles del recorte. Los 68 puntos siguen el orden iBUG 300-W con indexacion desde cero.

El entrenamiento parte del modelo publicado en el articulo y aplica self-training (fine-tuning con pseudoetiquetas) sobre rostros de dibujo animado y caricatura. El articulo original propone el uso de datos sinteticos generados con modelos de difusion para cubrir dominios con escasez de anotaciones. Para obtener la maxima precision, el pipeline recomendado ejecuta tres pasadas de recorte: cada pasada recorta un cuadrado centrado en la caja de la cara de 1,1 veces el lado mayor de la caja de los puntos anteriores, y reinyecta el recorte al modelo. No se publican en la informacion disponible el numero de tokens, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables a este tipo de modelo).

## Capacidades

- Deteccion de 68 puntos faciales (iBUG 300-W) en caras reales, dibujos animados, caricaturas y animacion 3D.
- Generalizacion a dominios artisticos con proporciones exageradas, gracias al entrenamiento multi-dominio y al self-training sobre caricaturas.
- Salida de curvas de parpado adicionales mediante el paquete `mdfld` (no forman parte de los 68 puntos estandar).
- Refinamiento iterativo de la precision mediante el esquema de tres pasadas de recorte.
- Ejecucion en GPU o CPU a traves de PyTorch/TorchScript, sin dependencia del codigo del repositorio.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente de vision.

## Casos de uso

- Animacion 2D y caricatura: extraer los 68 puntos de un personaje dibujado para rigging o interpolacion de expresiones; el modelo esta especificamente afinado para este dominio y supera al detector base en CariFace (NME 5,03 % frente a 6,70 %).
- Captura de movimiento facial en video: procesar fotogramas de caras reales con un NME de 1,74 % en datos no vistos, adecuado para driving de avatares en tiempo real si la latencia del pipeline de tres pasadas lo permite.
- Postproduccion y VFX: alinear o estabilizar rostros animados entre planos usando los puntos como referencia geometrica, incluso en estilos no fotograficos.
- Avatares y filtros en aplicaciones moviles: el modelo es pequeno y exportable a TorchScript, por lo que puede ejecutarse en dispositivos con aceleracion (GPU o CPU) sin infraestructura de servidor.
- Investigacion en deteccion de landmarks: servir como baseline multi-dominio para comparar tecnicas de adaptacion de dominio o de datos sinteticos.
- Control de calidad de datasets artisticos: detectar automaticamente caras mal anotadas o recortes erroneos en corpus de dibujos y caricaturas antes de entrenar otros modelos.
- Analisis de expresiones en animacion 3D: usar los puntos y las curvas de parpado para medir apertura ocular y gestos en personajes renderizados.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los de la model card, medidos con el pipeline de tres pasadas del paquete:

| Conjunto de evaluacion | Metrica | v1 | v2 |
|---|---|---|---|
| CariFace (1.560 caricaturas), 68 puntos | NME | 6,70 % | 5,03 % |
| CariFace, ojos | NME | 3,49 % | 2,78 % |
| CariFace, mandibula | NME | 10,42 % | 7,75 % |
| Fotogramas de video de caras reales no vistas | NME | 3,03 % | 1,74 % |

No se han publicado en la informacion disponible resultados de benchmarks estandar de face alignment (300-W, WFLW, COFW) ni comparaciones numericas con otros detectores.

## Requisitos de hardware

- VRAM estimada: no disponible; por el tamano del repositorio (0,0 GB) y la entrada de 256 x 256 px, el modelo es ligero y cabe holgadamente en cualquier GPU consumer, aunque no se publica la cifra exacta.
- GPU recomendadas: cualquier GPU con soporte CUDA (RTX 3060 o superior es suficiente en la practica); tambien puede ejecutarse en CPU.
- Cabe en GPU consumer: si, previsiblemente en todas las GPU modernas con al menos unos pocos GB de VRAM; la cifra concreta no esta publicada.
- Opciones de despliegue: PyTorch con TorchScript (`torch.jit.load`), el paquete `mdfld` (con extra `sam` para deteccion de cara) y el codigo STAR del repositorio con el checkpoint `.pkl`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El coste real depende del detector de caras previo (SAM en el paquete) y de las tres pasadas de recorte.

## Comparativa con modelos similares

| Modelo | Tipo | Puntos | Enfoque multi-dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MDFLD v2 (este) | Regresion de keypoints | 68 | Si (real, dibujo, caricatura, 3D) | research-only | HuggingFace + GitHub |
| STAR | Transformer de analisis facial | 68 | No especifico | no disponible en la informacion | Codigo publico |
| Detectores clasicos de face alignment (p. ej. basados en 300-W) | Regresion/heatmap | 68 | Limitado a fotografia | variable | Multiples |

No se dispone en la informacion proporcionada de datos numericos comparativos con alternativas concretas; la comparativa se limita a la categoria y al enfoque.

## Limitaciones y advertencias

- Licencia research-only: prohibido el uso comercial sin autorizacion; los pesos se ofrecen sin garantia.
- Los datos de entrenamiento incluyen conjuntos de terceros con sus propias condiciones (CariFace es solo para investigacion y varios sets de dibujos contienen obra artistica de terceros), lo que puede imponer restricciones adicionales.
- El rendimiento cae en la mandibula de caricaturas (NME 7,75 %), la region mas dificil por las proporciones exageradas.
- La precision depende del esquema de tres pasadas; con una sola pasada los resultados empeoran.
- Requiere un detector de cara previo (el paquete usa SAM); errores en la caja inicial degradan los puntos.
- No hay informacion publicada sobre sesgos por etnia, edad o genero, ni sobre robustez ante oclusiones, perfiles extremos o iluminacion adversa.
- El modelo predice solo geometria facial; no genera texto ni razona, por lo que no debe evaluarse con benchmarks de lenguaje.
- No se documentan tasas de fallo ni umbrales de confianza; en produccion conviene validar con datos propios antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zenonlee/MDFLD
- Articulo (arXiv): https://arxiv.org/abs/2401.13191
- Codigo en GitHub: https://github.com/zenonLEE/MDFLD
- Pagina del proyecto: https://zenonlee.github.io/MDFLD/
- Release v2.0 (checkpoint `.pkl`): https://github.com/zenonLEE/MDFLD/releases/tag/v2.0
- Terminos de uso: https://github.com/zenonLEE/MDFLD#terms-of-use
