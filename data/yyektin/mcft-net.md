# yyektin/MCFT-Net

## Resumen

MCFT-Net es un modelo compacto de superresolución de vídeo con referencia dispersa (sparse-reference video super-resolution) desarrollado por el usuario yyektin y publicado en Hugging Face. No se trata de un modelo generativo de propósito general, sino de una red neuronal convolucional residual de tan solo 173.732 parámetros que actúa como etapa de refinamiento sobre un operador determinista previo denominado MCFT v3 (Motion-Compensated Frequency Transfer). El sistema completo recibe un vídeo de baja resolución junto con un pequeño conjunto de fotogramas ancla en alta resolución real, y produce la reconstrucción en alta resolución de todos los fotogramas.

La relevancia del proyecto reside en su planteamiento híbrido: en lugar de emplear un modelo grande de caja negra para la superresolución, combina estimación de movimiento, transferencia de bandas de frecuencia y una restricción de consistencia con la observación de baja resolución, dejando a la CNN únicamente la tarea de aprender a confiar y corregir la propuesta determinista. Esto reduce drásticamente el coste computacional y el riesgo de alucinación de detalle inexistente.

El repositorio tiene un tamaño de 0.0 GB, cero descargas y un like en el momento de la consulta, lo que indica un proyecto de investigación incipiente y de nicho. La licencia es MIT y la librería declarada es PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN residual compacta (etapa de refinamiento) sobre operador determinista MCFT v3 con estimación de flujo óptico |
| Parametros totales | 173.732 (solo la CNN MCFT-Net) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0.0 GB, sin pesos publicados visibles) |

Parámetros adicionales de la arquitectura MCFT-Net: anchura (width) de 32 canales, 6 bloques residuales, arquitectura de tipo "confidence".

## Arquitectura y entrenamiento

El sistema MCFT se compone de dos etapas. La primera es un operador determinista, MCFT v3, que para cada fotograma no ancla realiza: construcción de una base (por defecto bicúbica, aunque puede sustituirse por la salida de un modelo SR externo como HAT, SwinIR, Real-ESRGAN, EDVR o BasicVSR++), búsqueda de anclas cercanas en el manifiesto disperso, estimación de movimiento mediante flujo óptico (OpenCV DIS en la ruta reproducible; soporte opcional de RAFT no incluido en el benchmark congelado), proyección de las anclas con compensación de movimiento y confianza de flujo, transferencia de bandas de frecuencia en luminancia (baja, media y alta), refinamiento local de fase con manejo de residuos multiescala, y una restricción de observación que reproyecta la estimación HR hacia el LR para evitar que el detalle de alta frecuencia viole el fotograma observado.

La segunda etapa, MCFT-Net, es una CNN residual que recibe un tensor multicanal de confianza/refinamiento construido a partir del fotograma base, el candidato determinista, información de residuo, características de consistencia LR y características de distancia/confianza a las anclas. Predice una corrección acotada alrededor de la base/candidato, no una imagen libre. El entrenamiento utiliza datos en streaming de Hugging Face (`bijinc/vimeo-90k-mini`) mediante la librería `datasets` en modo streaming, construyendo ejemplos sintéticos de anclas dispersas a partir de tríos de Vimeo (fotogramas t-1 y t+1 como anclas HR, t como objetivo). El modelo final se entrena con replay mixto: 75% REDS replay y 25% streaming (la información proporcionada se interrumpe en este punto). Una advertencia clave del autor: una red entrenada con entradas MCFT de base bicúbica no debe asumirse válida para entradas con base HAT/SwinIR/Real-ESRGAN; requiere reentrenamiento o ajuste fino con la misma familia de base.

## Capacidades

- Superresolución de vídeo con referencia dispersa: reconstruye todos los fotogramas de un vídeo LR a partir de un presupuesto de anclas HR reales (10% uniforme en los benchmarks REDS).
- Refinamiento aprendido de una propuesta determinista: aprende a confiar y corregir el candidato MCFT v3, no a generar la imagen desde cero.
- Estimación de movimiento mediante flujo óptico (OpenCV DIS; RAFT opcional en el helper del núcleo).
- Transferencia de bandas de frecuencia en luminancia (baja, media, alta).
- Restricción de consistencia con la observación LR (reproyección HR→LR).
- Integración como capa de refinamiento sobre modelos SR modernos (HAT, SwinIR, Real-ESRGAN, EDVR, BasicVSR++) cuando se entrena con esa familia de base.
- Entrenamiento con datos en streaming desde Hugging Face (`bijinc/vimeo-90k-mini`).
- No dispone de tool calling, capacidades de agente, multilingües ni modo thinking: es un modelo puramente de visión.

## Casos de uso

- Restauración de archivos de vídeo con anclas de alta calidad: en digitalización de material histórico donde se dispone de algunos fotogramas en alta resolución (por ejemplo, escaneos puntuales), MCFT puede propagar ese detalle al resto de la secuencia usando el 10% de anclas como referencia.
- Upstream de bajo coste en pipelines de producción audiovisual: al ser una CNN de 173.732 parámetros sobre un operador determinista, el coste de inferencia es muy inferior al de un VSR generativo grande, lo que permite procesar lotes grandes en CPU/GPU modestas.
- Mejora de vídeo comprimido o de baja resolución en transmisión: la restricción de observación LR evita que el detalle reconstruido contradiga el fotograma observado, algo útil en pipelines donde la fidelidad al original es requisito.
- Capa de refinamiento sobre un SR moderno: si se dispone de un modelo como Real-ESRGAN o BasicVSR++ ya desplegado, MCFT puede actuar como refinador consciente de anclas (requiere reentrenamiento con esa base).
- Investigación en superresolución con referencia dispersa: el protocolo de anclas uniformes al 10% y la evaluación sobre fotogramas no ancla ofrecen una base reproducible para comparar métodos.
- Prototipado académico y docencia: el tamaño reducido del repositorio y la separación clara entre etapa determinista y red aprendida lo hacen adecuado para estudiar VSR híbrido sin grandes recursos.
- Restauración de vídeo doméstico o de vigilancia con fotogramas clave de referencia: cuando existen capturas puntuales en alta calidad, el método puede transferir ese detalle al resto de la secuencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe el protocolo de evaluación en REDS (escala x2, degradación bicúbica OpenCV, 10% de anclas uniformes, evaluación sobre fotogramas no ancla) y menciona una demo BBB con anclas adaptativas, pero no incluye cifras numéricas de PSNR, SSIM ni comparaciones cuantitativas.

## Requisitos de hardware

- VRAM estimada: no disponible. Con 173.732 parámetros en la CNN, el coste de memoria de la red es mínimo (del orden de centenares de KB en fp32); el grueso del coste proviene del flujo óptico OpenCV DIS y del procesamiento de vídeo, no de la red.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño de la red, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) debería ser suficiente para la etapa CNN; el flujo óptico y la E/S de vídeo pueden dominar el tiempo de ejecución.
- ¿Cabe en GPU consumer? Sí, la red de 173.732 parámetros cabe holgadamente en cualquier GPU consumer; el cuello de botella es el pipeline de vídeo, no el modelo.
- Opciones de despliegue: el repositorio es PyTorch puro (`mcft_net.py`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de visión). El despliegue sería mediante scripts propios de PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MCFT-Net | CNN residual + operador determinista, VSR con referencia dispersa | 173.732 (CNN) | Vídeo LR + 10% anclas HR | MIT | Hugging Face, repo 0.0 GB |
| BasicVSR++ | VSR recurrente | no disponible en la información | Vídeo LR | no disponible | no disponible |
| Real-ESRGAN | SR de imagen/vídeo generativo | no disponible en la información | Imagen/vídeo LR | no disponible | no disponible |
| SwinIR | Transformer para restauración de imagen | no disponible en la información | Imagen LR | no disponible | no disponible |

La comparación cuantitativa no está disponible: la model card menciona BasicVSR++, Real-ESRGAN, SwinIR y HAT únicamente como posibles bases externas sobre las que aplicar MCFT, no como rivales benchmarkeados. No se aportan cifras de rendimiento relativas.

## Limitaciones y advertencias

- Requiere anclas HR reales: no es un VSR puro a partir de LR; sin presupuesto de anclas el método no aplica en su formulación actual.
- Dependencia de la familia de base: una red entrenada con base bicúbica no funciona de forma fiable con bases HAT/SwinIR/Real-ESRGAN sin reentrenamiento o ajuste fino.
- Riesgo de alucinación limitado por diseño (corrección acotada), pero la transferencia de alta frecuencia desde anclas puede introducir artefactos si el flujo óptico falla en regiones oclusas o de movimiento rápido.
- El flujo OpenCV DIS es la ruta reproducible; RAFT está presente pero no forma parte del benchmark congelado, por lo que su comportamiento no está validado en la model card.
- Sin datos de sesgo, idioma ni benchmarks publicados; no hay evidencia cuantitativa de calidad frente a alternativas.
- Licencia MIT: permite uso comercial, pero el repositorio no publica pesos visibles (0.0 GB) ni instrucciones de descarga, lo que limita su uso inmediato en producción.
- Proyecto con cero descargas y un like: madurez y soporte comunitario muy limitados.
- Sin cuantizaciones documentadas ni formatos de pesos declarados; la integración requiere el código fuente y los checkpoints del autor.

## Enlaces

- Hugging Face: https://huggingface.co/yyektin/MCFT-Net
- Dataset de streaming utilizado: https://huggingface.co/datasets/bijinc/vimeo-90k-mini
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios adicionales ni demos.
