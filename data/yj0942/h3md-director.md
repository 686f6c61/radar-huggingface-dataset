# yj0942/H3MD-Director

## Resumen

H3MD Director (H3MD 导演台) es un paquete de nodos personalizados para ComfyUI que permite renderizar vídeos largos de 2 a 3 minutos en una sola ejecución utilizando el modelo de generación de vídeo MiniMax H3, a resolución 1080P (o 2K para clips individuales de 15 segundos). Lo desarrolla el usuario yj0942 y se distribuye como mirror de descarga en Hugging Face, con el código fuente alojado en GitHub. No se trata de un modelo de pesos en sí, sino de una capa de orquestación que gestiona la generación por ventanas de contexto encadenadas sobre el modelo subyacente MiniMax H3.

La relevancia del proyecto radica en que resuelve el problema clásico de la generación de vídeo largo: la discontinuidad entre segmentos. Para ello introduce la técnica CCW (Chained Context Windows), que ejecuta las ventanas en orden temporal haciendo que cada una tome el relevo de la anterior, evitando el promedio de solapamientos que produce imágenes dobles en el enfoque estándar de ComfyUI. El paquete incluye además nodos de previsualización en baja resolución, redibujado local de fragmentos, interpolación de fotogramas y soporte de esqueleto (pose) para transferencia de movimiento.

El repositorio ocupa 0,2 GB e incluye el paquete de nodos, flujos de trabajo de ejemplo, documentación en inglés y chino, y un plan de demostración consistente en un videoclip musical de 11 planos y 2 minutos 40 segundos. La versión documentada es la 0.4.4 CCW.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (capa de nodos ComfyUI sobre MiniMax H3; el modelo base es de generación de vídeo) |
| Parámetros totales | No disponible |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible (genera ventanas de vídeo encadenadas; duración objetivo de 2 a 3 minutos) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (interfaz y documentación en inglés y chino) |
| Licencia | AGPL-3.0 |
| Formato de pesos | No disponible (el paquete se distribuye como archivos ZIP de nodos, no como pesos) |

## Arquitectura y entrenamiento

H3MD Director no es un modelo entrenado, sino un conjunto de nodos para ComfyUI que orquesta la inferencia de MiniMax H3. Su innovación principal es CCW (Chained Context Windows): en lugar de promediar las regiones de solapamiento entre ventanas de contexto consecutivas —como hace el mecanismo nativo de Context Windows de ComfyUI, que produce imágenes dobles—, CCW ejecuta las ventanas en orden temporal y cada una continúa a partir del resultado de la anterior. Esto elimina las costuras de continuación y la deriva entre segmentos, manteniendo los cortes duros limpios, y agrupa los planes largos únicamente en los cortes duros.

El paquete incorpora además un nodo de redibujado y previsualización que permite generar una versión en baja resolución o volver a dibujar unos segundos de un vídeo ya terminado, pudiendo modificar antes el prompt o las imágenes de referencia de ese plano. La interpolación de fotogramas ya no mezcla dos planos en un corte duro. Los flujos de ejemplo almacenan en caché los fotogramas a 8 bits, lo que reduce a la mitad el espacio en disco sin diferencia visible. No se dispone de información sobre datos de entrenamiento, número de tokens ni procesos de alineación, al no tratarse de un modelo con pesos propios.

## Capacidades

- Generación de vídeo largo de 2 a 3 minutos en una sola ejecución, a 1080P; 2K para clips individuales de 15 segundos.
- Modo de ventana con contexto encadenado (CCW) para continuidad sin costuras entre planos.
- Previsualización en baja resolución de un plan antes de renderizar en alta calidad.
- Redibujado local de fragmentos concretos de un vídeo terminado, con posibilidad de cambiar prompt o imágenes de referencia del plano.
- Transferencia de movimiento (TARA) mediante prompt con la etiqueta `motion_transfer:`, con soporte de esqueleto (pose) a través del nodo H3MD Motion.
- Interpolación de fotogramas con tratamiento correcto de los cortes duros.
- Refinado de rostros con opciones configurables (detector, feather) que permanecen editables cuando la entrada `face_refine` está conectada.
- Gestión de planes de vídeo con múltiples planos, ajustes por plano y exportación/importación de paquetes de plan.
- Caché de fotogramas a 8 bits para reducir el uso de disco.

## Casos de uso

- Producción de videoclips musicales: el plan de demostración incluido (11 planos, 2 minutos 40 segundos) muestra el flujo completo; el modelo encadena los planos sobre una única línea temporal para que la música y la narrativa visual no presenten saltos entre segmentos.
- Creación de contenido de formato largo para redes: generación de vídeos de 2 a 3 minutos en 1080P en una sola pasada, adecuada para piezas de YouTube o publicaciones que requieren continuidad visual.
- Iteración de planos concretos en postproducción: el nodo de redibujado permite regenerar solo unos segundos de un vídeo terminado tras ajustar el prompt o las imágenes de referencia, sin repetir el render completo.
- Replicación de movimiento a partir de vídeo de referencia: mediante `motion_transfer:` y el nodo H3MD Motion con soporte de esqueleto, se puede trasladar el movimiento de una grabación a un nuevo plano.
- Previsualización rápida de guiones: la generación en baja resolución permite validar la composición y el ritmo de un plan antes de comprometer el tiempo de render en alta calidad.
- Automatización de pipelines de vídeo en ComfyUI: al ser nodos nativos, los planes se pueden integrar en flujos de trabajo más amplios con otros nodos de ComfyUI, incluyendo el control de versiones del paquete mediante ComfyUI Manager o Comfy Registry.
- Restauración o mejora de rostros en planos generados: las opciones de refinado de cara permiten corregir detalles faciales en planos ya renderizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de rendimiento reportados por el autor son tiempos de ejecución medidos:

| Escenario | Hardware | Tiempo |
|---|---|---|
| Primer segmento del plan de demostración | RTX 5090 | ~8 minutos |
| Videoclip de 2 min 20 s a 1920×1088 | RTX 5090 | 2 h 18 min |

## Requisitos de hardware

- VRAM mínima: 16 GB; recomendada: 24 GB o superior.
- GPU recomendada: RTX 5090 (mediciones del autor); cualquier GPU con 24 GB o más de VRAM para el flujo completo.
- Cabe en GPU de consumo con al menos 16 GB de VRAM; el autor indica que existen ajustes para baja VRAM documentados en el README incluido en el ZIP.
- Software: ComfyUI 0.43 o superior; ComfyUI 0.44 o superior para el modo de vídeo largo sin costuras (Seamless long video).
- Despliegue: instalación como nodos personalizados en `ComfyUI/custom_nodes/`, o mediante ComfyUI Manager / Comfy Registry buscando "H3MD Director".
- Latencia y throughput: aproximadamente 8 minutos por el primer segmento del plan de demostración en una RTX 5090; 2 h 18 min para un vídeo de 2 min 20 s a 1920×1088 en el mismo hardware.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (orquestación de vídeo largo sobre MiniMax H3 en ComfyUI) con datos de parámetros, contexto o rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No es un modelo con pesos propios: requiere el modelo MiniMax H3 y los modelos auxiliares correspondientes, que ComfyUI ofrece descargar al ejecutar los flujos de ejemplo.
- Los tiempos de render son elevados: más de 2 horas para un vídeo de 2 minutos 20 segundos en una RTX 5090, lo que limita su uso en producción de alta cadencia.
- La licencia AGPL-3.0 impone obligaciones copyleft sobre el código: cualquier distribución o servicio en red basado en estos nodos debe publicar el código fuente modificado. Es preciso revisar su compatibilidad con el uso comercial previsto.
- El proyecto está en desarrollo activo con cambios frecuentes entre versiones menores (de 0.1.1 a 0.4.4 en el historial disponible), incluyendo correcciones de comportamiento que afectan al resultado, como el redondeo de la duración en la transferencia de movimiento o la gestión de la caché.
- La documentación y la interfaz están en inglés y chino; no se declaran idiomas soportados para la generación.
- Existen advertencias del propio autor sobre el comportamiento de los prompts en modo de replicación de movimiento: un prompt de baile estático sobre una guía con cámara en seguimiento puede provocar que la segunda ventana vuelva a la escena descrita en el prompt. Es necesario escribir el movimiento conforme al vídeo guía.
- Riesgo de deriva o inconsistencias en planes muy largos fuera del modo CCW; el autor recomienda usar el interruptor de vídeo largo sin costuras para planes con continuaciones.
- No se dispone de información sobre sesgos, tasas de alucinación visual ni evaluación cualitativa independiente.

## Enlaces

- Hugging Face: https://huggingface.co/yj0942/H3MD-Director
- GitHub (código fuente, documentación y actualizaciones): https://github.com/1113800942/comfy-h3md-director
- Mirror de descarga para China: sustituir `huggingface.co` por `hf-mirror.com` en la URL de Hugging Face
- ComfyUI Manager / Comfy Registry: buscar "H3MD Director"
