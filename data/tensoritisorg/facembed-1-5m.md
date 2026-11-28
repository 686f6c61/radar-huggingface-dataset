# TensoritisOrg/Facembed-1.5m

## Resumen

Facembed-1.5m es un modelo generativo de reconstruccion facial desarrollado por TensoritisOrg. Se trata de una red neuronal convolucional (CNN) de tan solo 1.483.903 parametros que reconstruye una imagen de rostro de 128x128 pixeles a partir de 158 valores numericos: un embedding facial dlib de 128 dimensiones mas 30 valores adicionales de color, pose y puntos de referencia (landmarks) medidos sobre la fotografia original.

El modelo aborda un problema concreto de privacidad y representacion biometrica: a partir de un vector de identidad facial (el embedding) y de metadatos medidos, genera una imagen que se parece a la persona pero que no es una copia fiel. Segun el autor, las salidas son "semblanzas, no copias". Esto lo diferencia de enfoques de inversion GAN puros, ya que el embedding dlib por si solo es insuficiente y requiere los 30 valores adicionales.

Es relevante ahora porque demuestra que con un presupuesto de parametros muy reducido (menos de 1,5 millones) y un entrenamiento de aproximadamente 6 horas en una unica RTX 4070 Ti SUPER se puede obtener un decodificador de embeddings faciales funcional, aunque con metricas de calidad moderadas (LPIPS 0.246, SSIM 0.478). El modelo se distribuye en formato safetensors junto con dos semillas alternativas y su codigo de inferencia en GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (decodificador convolucional, entrenado con discriminador PatchGAN espectralmente normalizado) |
| Parametros totales | 1.483.903 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision imagen-a-imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision, no linguistico) |
| Licencia | no disponible (sin licencia de codigo abierto otorgada; CelebA restringido a investigacion no comercial) |
| Formato de pesos | safetensors (model.safetensors y seeds/seed43.safetensors, seeds/seed44.safetensors) |

## Arquitectura y entrenamiento

El modelo es un decodificador convolucional que recibe como entrada un vector de 158 dimensiones (128 del embedding dlib mas 30 valores de color, pose y landmarks) y produce una imagen RGB de 128x128 en el rango [-1, 1]. Los pesos incluyen la normalizacion de entrada (`input.mean`, `input.std`), que debe aplicarse como `(x - mean) / std` antes del decodificador. Los pesos distribuidos corresponden a la EMA del decodificador (`decoder.*`) convertidos desde los checkpoints de entrenamiento, con tensores identicos tras la conversion.

El entrenamiento se realizo sobre CelebA con una particion por identidad: 155.585 imagenes de entrenamiento, 21.569 de validacion y 19.512 de test. La funcion de perdida combina L1, LPIPS (VGG), identidad FaceNet, GAN y feature matching. Se empleo un PatchGAN con proyeccion y normalizacion espectral con hinge loss, activado a partir de la epoca 10. El optimizador fue Adam con tasa de aprendizaje 3e-4, tamano de lote 32 y EMA de 0.999, entrenado en una unica RTX 4070 Ti SUPER durante aproximadamente 6 horas por semilla final. Se publican tres semillas (42, 43 y 44) con metricas casi identicas; la semilla 42 es la principal por tener el LPIPS de validacion mas bajo.

## Capacidades

- Reconstruccion facial imagen-a-imagen: genera un rostro de 128x128 a partir de un embedding dlib de 128 dimensiones mas 30 valores medidos de color, pose y landmarks.
- Decodificacion de embeddings biometricos: transforma representaciones de identidad en imagenes de semblante.
- Generacion condicionada por multiples atributos: los 30 valores adicionales permiten controlar tono de piel, orientacion y geometria facial de forma aproximada.
- Soporte de multiples semillas: tres conjuntos de pesos con comportamiento casi equivalente.
- Inferencia mediante script de linea de comandos (`reconstruct.py`) que alinea la foto, calcula los 158 valores y descarga los pesos.
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso ni procesamiento de lenguaje, al no ser un modelo linguistico.

## Casos de uso

- Investigacion en privacidad biometrica: permite estudiar hasta que punto un embedding facial filtrado revela informacion visual de la identidad, generando semblanzas a partir de vectores anonimizados y evaluando el riesgo de reidentificacion.
- Aumento de datos para reconocimiento facial: se pueden sintetizar variaciones de rostro condicionadas por pose y color para ampliar conjuntos de entrenamiento en entornos controlados y con consentimiento.
- Pruebas de sistemas de verificacion: util para generar caras de prueba con identidad conocida y evaluar la robustez de pipelines de reconocimiento frente a semblanzas generadas.
- Docencia y demostraciones sobre embeddings: sirve como ejemplo didactico de bajo coste (1,5 M de parametros) para explicar la relacion entre espacio latente biometrico y pixeles.
- Analisis de sesgos en modelos de reconstruccion: al estar entrenado solo con CelebA, permite medir la degradacion de calidad fuera de ese dominio y documentar limitaciones por grupos demograficos.
- Prototipado de interfaces de visualizacion de embeddings: util para construir visores que muestren una aproximacion visual de un vector facial en herramientas de auditoria interna.

## Benchmarks y rendimiento

Resultados sobre el split de test de CelebA (19.512 fotos), promedio de las 3 semillas:

| Metrica | Valor |
|---|---|
| LPIPS (AlexNet) | 0.246 |
| SSIM | 0.478 |
| PSNR | 14.61 dB |
| FID (5.000 imagenes) | 56.4 |
| FaceNet top-1 (999 personas) | 59.1% |
| FaceNet top-5 (999 personas) | 77.1% |

El autor advierte que las puntuaciones de identidad son optimistas, ya que FaceNet se uso como perdida de entrenamiento y tambien como evaluador; ningun reconocedor facial independiente ha puntuado estos modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida, del orden de cientos de MB o menos, dado el tamano de 1,48 M de parametros y la salida de 128x128; no se publica una cifra exacta.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el entrenamiento se realizo en una RTX 4070 Ti SUPER.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con al menos unos pocos GB de VRAM, e incluso en CPU para inferencia puntual.
- Opciones de despliegue: PyTorch con el script `scripts/reconstruct.py` del repositorio de GitHub; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Metricas publicadas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Facembed-1.5m | 1,48 M | CNN decodificadora de embedding dlib + 30 valores | LPIPS 0.246, SSIM 0.478, FID 56.4 | no disponible (CelebA no comercial) | Hugging Face + GitHub |
| Inversion GAN clasica (p. ej. StyleGAN2 + encoder) | decenas de millones | Inversion en espacio latente de GAN | no disponible en esta ficha | variable segun modelo | variable |
| Autoencoders faciales genericos | variable | reconstruccion imagen-a-imagen | no disponible en esta ficha | variable | variable |

No se dispone de una comparativa numerica directa con alternativas equivalentes en la informacion proporcionada; los datos de la tabla para modelos alternativos son orientativos y no verificados en esta ficha.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente con CelebA (fotos de celebridades); se espera un rendimiento inferior fuera de ese dominio.
- No se ha medido el comportamiento por grupos demograficos; no debe asumirse un rendimiento equitativo entre ellos.
- Pierde sombreros, poses de manos, microfonos y fondos detallados; los angulos dificiles salen borrosos.
- No se ha comprobado el solapamiento entre los datos de entrenamiento de dlib o FaceNet y las personas del test de CelebA, lo que puede inflar las metricas.
- Las puntuaciones de identidad FaceNet son optimistas por circularidad entre perdida y evaluador.
- Sin licencia de codigo abierto otorgada; CelebA limita el uso a investigacion no comercial. Deben revisarse los terminos de CelebA, FaceNet, dlib e InsightFace antes de cualquier otro uso.
- Riesgo de uso indebido: no debe emplearse para identificar, perfilar o suplantar a nadie, ni para reconstruir el rostro de una persona sin su permiso. La salida no constituye evidencia de como es una persona.
- Los embeddings faciales deben tratarse como datos biometricos sensibles.
- El script de inferencia no se ha ejecutado de extremo a extremo con los modelos faciales reales segun el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TensoritisOrg/Facembed-1.5m
- Repositorio de codigo y documentacion: https://github.com/kenedii/Face-Reconstruction-from-Embeddings
- Dataset CelebA: https://mmlab.ie.cuhk.edu.hk/projects/CelebA.html
- Imagen de caras de test y reconstrucciones: https://raw.githubusercontent.com/kenedii/Face-Reconstruction-from-Embeddings/main/docs/images/1_test_faces.png
- Imagen de metricas de test: https://raw.githubusercontent.com/kenedii/Face-Reconstruction-from-Embeddings/main/docs/images/7_test_summary.png
- Diagrama de arquitectura: https://raw.githubusercontent.com/kenedii/Face-Reconstruction-from-Embeddings/main/docs/images/architecture.png
